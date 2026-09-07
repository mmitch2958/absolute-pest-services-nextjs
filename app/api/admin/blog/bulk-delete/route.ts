import { NextRequest, NextResponse } from 'next/server';
import { requireAdminJson } from '@/lib/admin-ai';
import { sql } from '@/lib/db';

function normalizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0),
  )].slice(0, 100);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminJson();
  if (authError) return authError;

  try {
    const { ids: rawIds } = await request.json();
    const ids = normalizeIds(rawIds);
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Select at least one blog post' }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM blog_posts
      WHERE id = ANY(${ids}::int[])
      RETURNING id
    `;

    return NextResponse.json({ deletedCount: deleted.length });
  } catch (error: any) {
    console.error('[blog/bulk-delete]', error);
    return NextResponse.json({ error: error.message || 'Bulk delete failed' }, { status: 500 });
  }
}