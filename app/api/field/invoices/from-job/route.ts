import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';
import { computeTotals, dueDateFor, generateInvoiceNumber, newViewToken } from '@/lib/invoices';
import { sendInvoiceToCustomer } from '@/lib/email';
import { sendInvoiceSMSToCustomer } from '@/lib/sms';

/**
 * POST /api/field/invoices/from-job
 *
 * Field tech endpoint. Creates an invoice from a completed job log and
 * immediately emails / texts it to the customer.
 *
 * Body:
 *   { jobLogId: number, amount?: string|number, note?: string,
 *     channels: ('email'|'sms')[] }   // at least one required
 *
 * Returns: { success, invoice, invoiceUrl, sent: { email, sms }, results }
 */
export async function POST(request: NextRequest) {
  const session = await getFieldSession();
  if (!session.employeeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const jobLogId = Number(body?.jobLogId);
    const amountOverride = body?.amount;
    const note: string | undefined = body?.note?.trim() || undefined;
    const channels: string[] = Array.isArray(body?.channels) ? body.channels : [];
    const emailOverride: string | undefined = typeof body?.email === 'string' ? body.email.trim() || undefined : undefined;
    const additionalEmails: string[] = Array.isArray(body?.additionalEmails)
      ? body.additionalEmails.map((e: any) => String(e).trim()).filter(Boolean)
      : [];

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!jobLogId || isNaN(jobLogId)) {
      return NextResponse.json({ error: 'jobLogId required' }, { status: 400 });
    }
    const wantEmail = channels.includes('email');
    const wantSms = channels.includes('sms');
    if (!wantEmail && !wantSms) {
      return NextResponse.json({ error: 'Pick at least one channel (email or sms)' }, { status: 400 });
    }

    // Load job + linked client
    const jl = (await sql`
      SELECT j.id, j.client_id, j.customer_name, j.amount, j.work_performed,
             j.serviced_area, j.site_address, j.site_location, j.job_date,
             j.materials, fe.name AS technician_name,
             c.id AS c_id, c.name AS c_name, c.email AS c_email, c.phone AS c_phone,
             c.property_type
      FROM job_logs j
      LEFT JOIN field_employees fe ON fe.id = j.employee_id
      LEFT JOIN clients c ON c.id = j.client_id
      WHERE j.id = ${jobLogId}
      LIMIT 1
    `) as any[];

    if (jl.length === 0) {
      return NextResponse.json({ error: 'Job log not found' }, { status: 404 });
    }
    const job = jl[0];
    if (!job.client_id) {
      return NextResponse.json({
        error: 'This job has no linked client. Ask admin to link a client to it first.',
      }, { status: 400 });
    }

    // Email target: explicit entry from the tech wins, otherwise the on-file email.
    const targetEmail = emailOverride || job.c_email;
    if (wantEmail) {
      if (!targetEmail) {
        return NextResponse.json({ error: 'Enter the customer\'s email to send the invoice.' }, { status: 400 });
      }
      if (!EMAIL_RE.test(targetEmail)) {
        return NextResponse.json({ error: 'That email address doesn\'t look valid.' }, { status: 400 });
      }
    }
    for (const addr of additionalEmails) {
      if (!EMAIL_RE.test(addr)) {
        return NextResponse.json({ error: `That additional email doesn't look valid: ${addr}` }, { status: 400 });
      }
    }
    if (wantSms && !job.c_phone) {
      return NextResponse.json({ error: 'Customer has no phone on file' }, { status: 400 });
    }

    // Ensure no invoice exists yet for this job
    const existing = (await sql`
      SELECT id FROM invoices WHERE job_log_id = ${jobLogId} LIMIT 1
    `) as any[];
    if (existing.length > 0) {
      return NextResponse.json({
        error: 'An invoice already exists for this job. Open it in Admin to resend.',
        existingInvoiceId: existing[0].id,
      }, { status: 409 });
    }

    // Persist a newly-entered address so it's on file for future invoices
    // (only when the tech supplies one for a customer with no email on record).
    if (wantEmail && emailOverride && !job.c_email) {
      await sql`
        UPDATE clients SET email = ${emailOverride}
        WHERE id = ${job.client_id}
      `;
    }

    const amount = amountOverride !== undefined ? amountOverride : (job.amount ?? '0');
    const propertyType = job.property_type || 'residential';

    const items = [{
      description: `${job.serviced_area} — ${job.site_location}`.trim(),
      quantity: 1,
      unitRate: amount,
      taxRate: 0,
      jobLogId: job.id,
      serviceDate: job.job_date,
      technicianName: job.technician_name,
      serviceType: job.serviced_area,
      serviceAddress: job.site_address,
      servicedArea: job.serviced_area,
      materials: job.materials,
    }];

    const totals = computeTotals(items);
    const issueDate = new Date();
    const dueDate = dueDateFor(propertyType, issueDate);
    const viewToken = newViewToken();

    // Insert invoice as DRAFT first; only flip to 'sent' after successful delivery.
    // Retry on unique-constraint violation against invoice_number (race-safe).
    let invoice: any = null;
    let invoiceNumber = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      invoiceNumber = await generateInvoiceNumber(issueDate.getFullYear());
      try {
        const invRows = (await sql`
          INSERT INTO invoices (
            invoice_number, client_id, job_log_id, status,
            issue_date, due_date,
            subtotal, tax_total, total,
            notes, view_token
          ) VALUES (
            ${invoiceNumber}, ${job.client_id}, ${job.id}, 'draft',
            ${issueDate.toISOString()}, ${dueDate.toISOString()},
            ${totals.subtotal}, ${totals.taxTotal}, ${totals.total},
            ${note || null}, ${viewToken}
          )
          RETURNING *
        `) as any[];
        invoice = invRows[0];
        break;
      } catch (e: any) {
        const isDup = e?.code === '23505' || /duplicate key|unique constraint/i.test(e?.message || '');
        if (!isDup || attempt === 4) throw e;
        await new Promise(r => setTimeout(r, 25 + Math.random() * 50));
      }
    }
    if (!invoice) throw new Error('Could not allocate invoice number');

    // Insert line item
    const li = totals.items[0];
    await sql`
      INSERT INTO invoice_line_items (
        invoice_id, description, quantity, unit_rate, tax_rate,
        line_total, line_tax, materials, sort_order,
        service_date, technician_name, service_type,
        service_address, serviced_area, job_log_id
      ) VALUES (
        ${invoice.id}, ${li.description}, ${String(li.quantity)},
        ${String(li.unitRate)}, ${String(li.taxRate ?? 0)},
        ${li.lineTotal}, ${li.lineTax},
        ${li.materials ? JSON.stringify(li.materials) : null}, 0,
        ${li.serviceDate || null}, ${li.technicianName || null},
        ${li.serviceType || null}, ${li.serviceAddress || null},
        ${li.servicedArea || null}, ${li.jobLogId || null}
      )
    `;

    // Initial status log
    await sql`
      INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
      VALUES (${invoice.id}, NULL, 'draft', ${'field:' + session.employeeId}, 'Created from job log')
    `;

    // Build public link
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'absolutepestservices.com';
    const invoiceUrl = `${proto}://${host}/invoice/${viewToken}`;

    // Attempt to send BEFORE marking as sent
    const results: Record<string, any> = {};
    if (wantEmail) {
      results.email = await sendInvoiceToCustomer({
        to: targetEmail as string,
        cc: additionalEmails.length > 0 ? additionalEmails : undefined,
        ccInternal: false,
        customerName: job.c_name,
        invoiceNumber,
        total: totals.total,
        dueDate: dueDate.toISOString(),
        invoiceUrl,
        personalMessage: note,
      });
    }
    if (wantSms) {
      results.sms = await sendInvoiceSMSToCustomer({
        phone: job.c_phone,
        customerName: job.c_name,
        invoiceNumber,
        total: totals.total,
        invoiceUrl,
      });
    }

    const anyOk = (results.email?.success ?? false) || (results.sms?.success ?? false);
    if (!anyOk) {
      // Leave invoice as draft so admin can retry from Admin UI
      return NextResponse.json({
        error: 'Failed to deliver invoice. The invoice was saved as a draft — open it in Admin and retry.',
        invoice, invoiceUrl, results,
      }, { status: 502 });
    }

    // Success: flip to 'sent' and mark job log as 'invoiced'
    const sentRows = (await sql`
      UPDATE invoices SET status = 'sent', sent_at = NOW()
      WHERE id = ${invoice.id} RETURNING *
    `) as any[];
    invoice = sentRows[0];

    const channelNote = [wantEmail && results.email?.success ? 'email' : null,
                        wantSms && results.sms?.success ? 'sms' : null]
                        .filter(Boolean).join('+');
    await sql`
      INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
      VALUES (${invoice.id}, 'draft', 'sent', ${'field:' + session.employeeId}, ${channelNote})
    `;

    await sql`UPDATE job_logs SET status = 'invoiced' WHERE id = ${jobLogId} AND status NOT IN ('paid','cancelled')`;

    return NextResponse.json({
      success: true,
      invoice, invoiceUrl,
      sent: {
        email: wantEmail && (results.email?.success ?? false),
        sms: wantSms && (results.sms?.success ?? false),
      },
      results,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[field/invoices/from-job] failed:', err);
    return NextResponse.json({ error: 'Failed to create and send invoice', detail: err?.message }, { status: 500 });
  }
}
