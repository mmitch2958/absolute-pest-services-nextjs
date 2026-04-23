import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';
import { sendInvoiceToCustomer } from '@/lib/email';
import { sendInvoiceSMSToCustomer } from '@/lib/sms';

/**
 * POST /api/admin/invoices/[id]/send
 *
 * Body (all optional):
 *   { email?: string, phone?: string, channels?: ('email'|'sms')[],
 *     subject?: string, message?: string, ccInternal?: boolean }
 *
 * - If `email` provided OR channels includes 'email', sends email.
 * - If `phone` provided OR channels includes 'sms', sends SMS.
 * - If neither: defaults to using whatever's on file for the client.
 *
 * Updates invoice: status='sent', sent_at=NOW (if currently draft).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const overrideEmail: string | undefined = body.email?.trim() || undefined;
    const overridePhone: string | undefined = body.phone?.trim() || undefined;
    const channels: string[] = Array.isArray(body.channels) ? body.channels : [];
    const personalMessage: string | undefined = body.message?.trim() || undefined;
    const ccInternal: boolean = !!body.ccInternal;

    // Load invoice + client
    const rows = (await sql`
      SELECT i.id, i.invoice_number, i.status, i.total, i.due_date, i.view_token,
             c.name AS client_name, c.email AS client_email, c.phone AS client_phone
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE i.id = ${invoiceId}
      LIMIT 1
    `) as any[];
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const inv = rows[0];

    if (inv.status === 'void') {
      return NextResponse.json({ error: 'Cannot send a voided invoice' }, { status: 400 });
    }
    if (!inv.view_token) {
      return NextResponse.json({ error: 'Invoice missing view token — cannot generate public link' }, { status: 500 });
    }

    // Build the public invoice URL from request origin
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'absolutepestservices.com';
    const invoiceUrl = `${proto}://${host}/invoice/${inv.view_token}`;

    // Determine targets
    const sendEmail = !!overrideEmail || channels.includes('email') || (channels.length === 0 && !!inv.client_email);
    const sendSms = !!overridePhone || channels.includes('sms') || (channels.length === 0 && !!inv.client_phone && !sendEmail);

    const targetEmail = overrideEmail || inv.client_email;
    const targetPhone = overridePhone || inv.client_phone;

    if (sendEmail && !targetEmail) {
      return NextResponse.json({ error: 'No email on file for this client' }, { status: 400 });
    }
    if (sendSms && !targetPhone) {
      return NextResponse.json({ error: 'No phone on file for this client' }, { status: 400 });
    }
    if (!sendEmail && !sendSms) {
      return NextResponse.json({ error: 'No email or phone available to send to' }, { status: 400 });
    }

    const results: Record<string, any> = {};

    if (sendEmail) {
      results.email = await sendInvoiceToCustomer({
        to: targetEmail,
        ccInternal,
        customerName: inv.client_name,
        invoiceNumber: inv.invoice_number,
        total: inv.total,
        dueDate: inv.due_date,
        invoiceUrl,
        personalMessage,
      });
    }
    if (sendSms) {
      results.sms = await sendInvoiceSMSToCustomer({
        phone: targetPhone,
        customerName: inv.client_name,
        invoiceNumber: inv.invoice_number,
        total: inv.total,
        invoiceUrl,
      });
    }

    const anySuccess = (results.email?.success ?? false) || (results.sms?.success ?? false);
    if (!anySuccess) {
      return NextResponse.json({
        error: 'Failed to send invoice',
        results,
      }, { status: 500 });
    }

    // Mark sent if currently draft
    if (inv.status === 'draft') {
      await sql`
        UPDATE invoices
        SET status = 'sent', sent_at = NOW(), updated_at = NOW()
        WHERE id = ${invoiceId}
      `;
      await sql`
        INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
        VALUES (${invoiceId}, 'draft', 'sent', ${'admin:' + session.userId},
                ${(sendEmail ? 'email' : '') + (sendEmail && sendSms ? '+sms' : sendSms ? 'sms' : '')})
      `;
    }

    // Sync linked job log status
    await sql`
      UPDATE job_logs SET status = 'invoiced'
      WHERE id IN (SELECT job_log_id FROM invoices WHERE id = ${invoiceId} AND job_log_id IS NOT NULL)
        AND status NOT IN ('paid', 'cancelled')
    `;

    return NextResponse.json({
      success: true,
      invoiceUrl,
      sent: { email: !!sendEmail, sms: !!sendSms },
      results,
    });
  } catch (err: any) {
    console.error('[admin/invoices/[id]/send] failed:', err);
    return NextResponse.json({ error: 'Failed to send invoice', detail: err?.message }, { status: 500 });
  }
}
