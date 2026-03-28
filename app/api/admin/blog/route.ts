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

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      const rows = await sql`
        SELECT id, title, slug, excerpt, author, category, tags, is_published, published_at, created_at
        FROM blog_posts
        WHERE title ILIKE ${pattern}
           OR author ILIKE ${pattern}
           OR category ILIKE ${pattern}
        ORDER BY created_at DESC
        LIMIT 100
      `;
      return NextResponse.json({ posts: rows });
    }

    const rows = await sql`
      SELECT id, title, slug, excerpt, author, category, tags, is_published, published_at, created_at
      FROM blog_posts
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ posts: rows });
  } catch (err) {
    console.error('[admin/blog] GET error:', err);
    return NextResponse.json({ error: 'Failed to load blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, author, category, tags, isPublished, metaTitle, metaDescription, featuredImage } = body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim() || !author?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'title, excerpt, content, author, category are required' }, { status: 400 });
    }

    const finalSlug = slug?.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const publishedAt = isPublished ? new Date() : null;

    const result = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, is_published, published_at, meta_title, meta_description, featured_image)
      VALUES (
        ${title.trim()}, ${finalSlug}, ${excerpt.trim()}, ${content.trim()},
        ${author.trim()}, ${category.trim()},
        ${Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])},
        ${isPublished || false},
        ${publishedAt},
        ${metaTitle?.trim() || null},
        ${metaDescription?.trim() || null},
        ${featuredImage?.trim() || null}
      )
      RETURNING id, title, slug, excerpt, content, author, category, tags, is_published, published_at, meta_title, meta_description, featured_image, created_at
    `;

    return NextResponse.json({ post: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/blog] POST error:', err);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
