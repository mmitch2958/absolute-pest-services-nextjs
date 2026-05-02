import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { feedUrl } = body;

    if (!feedUrl?.trim()) {
      return NextResponse.json({ error: 'Feed URL is required' }, { status: 400 });
    }

    const parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator'],
        ],
      },
    });

    console.log(`[syndicate] Fetching feed: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl.trim());
    console.log(`[syndicate] Feed "${feed.title}" — ${feed.items?.length ?? 0} items`);

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [] as { title: string; status: 'imported' | 'skipped' | 'error'; reason?: string }[],
    };

    if (!feed.items?.length) {
      return NextResponse.json({
        success: true,
        message: 'Feed fetched successfully but contained no articles.',
        results,
      });
    }

    // Pre-fetch all existing slugs in ONE query
    const candidates = feed.items.map(it => ({
      item: it,
      title: it.title?.trim() || 'Untitled',
      slug: slugify(it.title?.trim() || 'Untitled'),
    }));
    const slugList = candidates.map(c => c.slug);
    const existingRows = slugList.length
      ? (await sql`SELECT slug FROM blog_posts WHERE slug = ANY(${slugList})`) as Array<{ slug: string }>
      : [];
    const existingSet = new Set(existingRows.map(r => r.slug));

    // Process all items in parallel (insert is independent per item)
    await Promise.all(candidates.map(async ({ item, title, slug }) => {
      try {
        if (existingSet.has(slug)) {
          results.skipped++;
          results.details.push({ title, status: 'skipped', reason: 'Already exists' });
          return;
        }

        const contentHtml = (item as any).contentEncoded || item.content || '';
        const imgMatch = contentHtml.match(/<img[^>]+src="([^">]+)"/);
        const featuredImage: string | null = imgMatch ? imgMatch[1] : null;

        const plainText = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const excerpt = item.contentSnippet?.trim() ||
          (plainText.length > 300 ? plainText.substring(0, 297) + '…' : plainText) || '';

        const tags: string[] = item.categories ?? [];
        const category = tags[0] ?? 'General';
        const author = (item as any).creator || (item as any)['dc:creator'] || 'Absolute Pest Services';
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        await sql`
          INSERT INTO blog_posts (
            title, slug, excerpt, content, author, category, tags,
            featured_image, meta_title, meta_description,
            is_published, published_at, created_at, updated_at
          ) VALUES (
            ${title}, ${slug}, ${excerpt}, ${contentHtml}, ${author},
            ${category}, ${tags}, ${featuredImage},
            ${title}, ${excerpt.substring(0, 160)},
            ${true}, ${publishedAt}, NOW(), NOW()
          )
          ON CONFLICT (slug) DO NOTHING
        `;

        results.imported++;
        results.details.push({ title, status: 'imported' });
      } catch (err: any) {
        console.error(`[syndicate] Error on "${title}":`, err.message);
        results.errors++;
        results.details.push({ title, status: 'error', reason: err.message ?? 'Unknown error' });
      }
    }));

    return NextResponse.json({
      success: true,
      message: `Done: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`,
      results,
    });
  } catch (err: any) {
    console.error('[syndicate] Fatal error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to syndicate RSS feed' },
      { status: 500 }
    );
  }
}
