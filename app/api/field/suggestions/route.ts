import { NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getFieldSession();
    if (!session.employeeId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const logs = await sql`SELECT customer_name, site_location, serviced_area FROM job_logs ORDER BY job_date DESC LIMIT 500`;
    const locations = await sql`SELECT name, customer_name FROM site_locations`;
    const fieldCustomers = await sql`SELECT name FROM field_customers ORDER BY name`;
    const clients = await sql`SELECT id, name, address, property_type FROM clients ORDER BY name`;

    const dedup = (items: string[]) => {
      const seen = new Map<string, string>();
      for (const item of items) {
        const key = item.toLowerCase();
        if (!seen.has(key)) seen.set(key, item);
      }
      return [...seen.values()].sort((a, b) => a.localeCompare(b));
    };

    const customerNames = [
      ...logs.map((l: any) => l.customer_name?.trim()).filter(Boolean),
      ...locations.map((l: any) => l.customer_name?.trim()).filter(Boolean),
      ...fieldCustomers.map((c: any) => c.name?.trim()).filter(Boolean),
    ];
    const mergedCustomers = dedup(customerNames);

    const customerLocations: Record<string, string[]> = {};
    const locationAreas: Record<string, string[]> = {};

    for (const log of logs) {
      const cust = (log.customer_name || '').trim();
      const loc = (log.site_location || '').trim();
      const area = (log.serviced_area || '').trim();
      if (cust && loc) {
        const key = cust.toLowerCase();
        if (!customerLocations[key]) customerLocations[key] = [];
        if (!customerLocations[key].some((l: string) => l.toLowerCase() === loc.toLowerCase())) {
          customerLocations[key].push(loc);
        }
      }
      if (loc && area) {
        const key = loc.toLowerCase();
        if (!locationAreas[key]) locationAreas[key] = [];
        if (!locationAreas[key].some((a: string) => a.toLowerCase() === area.toLowerCase())) {
          locationAreas[key].push(area);
        }
      }
    }

    for (const loc of locations) {
      const custKey = (loc.customer_name || '').toLowerCase();
      if (custKey) {
        if (!customerLocations[custKey]) customerLocations[custKey] = [];
        if (!customerLocations[custKey].some((l: string) => l.toLowerCase() === loc.name.toLowerCase())) {
          customerLocations[custKey].push(loc.name);
        }
      }
    }

    for (const key in customerLocations) customerLocations[key].sort();
    for (const key in locationAreas) locationAreas[key].sort();

    return NextResponse.json({
      success: true,
      customers: mergedCustomers,
      customerLocations,
      locationAreas,
      clients: clients.map((c: any) => ({ id: c.id, name: c.name, address: c.address, propertyType: c.property_type || 'residential' })),
    });
  } catch (err) {
    console.error('[field/suggestions] GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
