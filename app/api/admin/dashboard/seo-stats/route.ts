import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.userId || s.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/admin/dashboard/seo-stats
 * Local SEO content metrics: published blog posts, latest posts,
 * city/service page coverage estimate.
 */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const [postCount, recentPosts, postsByCategory] = await Promise.all([
      sql`SELECT
            COUNT(*) FILTER (WHERE is_published = true)::int AS published,
            COUNT(*) FILTER (WHERE is_published = false)::int AS drafts,
            COUNT(*)::int AS total
          FROM blog_posts`,
      sql`SELECT id, title, slug, category, published_at, is_published::int AS is_published
          FROM blog_posts
          ORDER BY COALESCE(published_at, created_at) DESC LIMIT 10`,
      sql`SELECT category AS label, COUNT(*)::int AS n
          FROM blog_posts WHERE is_published = true
          GROUP BY category ORDER BY n DESC LIMIT 10`,
    ]);

    // Normalize is_published to boolean (Neon HTTP driver can return bool as int)
    const recent = (recentPosts as any[]).map(p => ({
      ...p,
      is_published: p.is_published === 1 || p.is_published === true,
    }));

    return NextResponse.json({
      posts: (postCount as any[])[0],
      recent,
      categories: postsByCategory,
    });
  } catch (e: any) {
    console.error('[seo-stats]', e);
    return NextResponse.json({ error: 'Failed to load SEO stats' }, { status: 500 });
  }
}
