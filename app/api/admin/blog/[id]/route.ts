import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql, db } from '@/lib/db';
import { blogPosts } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { saveBase64ImageToDisk, isBase64DataUrl } from '@/lib/blog-image';

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

    // Normalise camelCase and snake_case field names to Drizzle schema camelCase
    const snakeToCamel: Record<string, string> = {
      featured_image: 'featuredImage',
      is_published: 'isPublished',
      published_at: 'publishedAt',
      meta_title: 'metaTitle',
      meta_description: 'metaDescription',
    };

    const drizzleAllowed = new Set([
      'title', 'slug', 'excerpt', 'content', 'author', 'category', 'tags',
      'featuredImage', 'isPublished', 'publishedAt', 'metaTitle', 'metaDescription',
    ]);

    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      const camelKey = snakeToCamel[key] ?? key;
      if (drizzleAllowed.has(camelKey)) {
        updates[camelKey] = value;
      }
    }

    // Auto-set publishedAt when first publishing
    if (updates.isPublished === true && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }

    // If featuredImage is a base64 data URL, save to disk to avoid exceeding
    // Neon HTTP driver's per-parameter size limit
    if (typeof updates.featuredImage === 'string' && isBase64DataUrl(updates.featuredImage)) {
      const slugHint = (updates.slug as string | undefined) ?? `post-${postId}`;
      updates.featuredImage = saveBase64ImageToDisk(updates.featuredImage, slugHint);
    }

    // Always update updatedAt
    updates.updatedAt = new Date();

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, postId))
      .returning();

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
