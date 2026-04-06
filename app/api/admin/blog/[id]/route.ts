import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT * FROM blog_posts WHERE id = ${postId} LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    console.error('[admin/blog/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load blog post' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = [
      'title', 'slug', 'excerpt', 'content', 'author', 'category', 'tags',
      'is_published', 'published_at', 'meta_title', 'meta_description', 'featured_image',
    ];
    const camelToSnake: Record<string, string> = {
      metaTitle: 'meta_title', metaDescription: 'meta_description', featuredImage: 'featured_image',
      isPublished: 'is_published', publishedAt: 'published_at',
    };

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      const snakeKey = camelToSnake[key] || key;
      if (allowedKeys.includes(snakeKey)) {
        updates[snakeKey] = value;
      }
    }

    if (body.isPublished === true && !updates.published_at) {
      updates.published_at = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sql`UPDATE blog_posts SET ${sql(updates as any)} WHERE id = ${postId} RETURNING *`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ post: result[0] });
  } catch (err) {
    console.error('[admin/blog/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await sql`DELETE FROM blog_posts WHERE id = ${postId} RETURNING id`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/blog/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
