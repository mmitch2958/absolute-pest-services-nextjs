import { NextRequest } from 'next/server';
import { requireAdminJson } from '@/lib/admin-ai';
import { generateBlogImage } from '@/lib/blog-image-generation';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface BlogImageRow {
  id: number;
  title: string;
  category: string;
  excerpt: string;
}

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

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

  let mode: 'missing' | 'selected';
  let ids: number[];

  try {
    const body = await request.json();
    mode = body.mode === 'missing' ? 'missing' : 'selected';
    ids = normalizeIds(body.ids);
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (mode === 'selected' && ids.length === 0) {
    return Response.json({ error: 'Select at least one blog post' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        try {
          send(controller, { type: 'heartbeat' });
        } catch {
          // The request has already closed.
        }
      }, 10000);

      try {
        const rows = mode === 'missing'
          ? await sql`
              SELECT id, title, category, excerpt
              FROM blog_posts
              WHERE featured_image IS NULL
                 OR BTRIM(featured_image) = ''
                 OR featured_image LIKE '/blog-images/%'
                 OR featured_image LIKE '/uploads/blog-images/%'
              ORDER BY created_at DESC
              LIMIT 100
            ` as BlogImageRow[]
          : await sql`
              SELECT id, title, category, excerpt
              FROM blog_posts
              WHERE id = ANY(${ids}::int[])
              ORDER BY created_at DESC
            ` as BlogImageRow[];

        send(controller, {
          type: 'start',
          total: rows.length,
          posts: rows.map(post => ({ id: post.id, title: post.title })),
        });

        let savedCount = 0;
        let failedCount = 0;

        for (const post of rows) {
          if (request.signal.aborted) break;
          send(controller, { type: 'item_start', id: post.id });

          try {
            const image = await generateBlogImage(post.title, post.category, post.excerpt);
            await sql`
              UPDATE blog_posts
              SET featured_image = ${image.imageUrl}, updated_at = NOW()
              WHERE id = ${post.id}
            `;
            savedCount++;
            send(controller, {
              type: 'item_success',
              id: post.id,
              imageUrl: image.imageUrl,
              source: image.source,
            });
          } catch (error: any) {
            failedCount++;
            console.error(`[blog/bulk-images] Post ${post.id} failed:`, error);
            send(controller, {
              type: 'item_error',
              id: post.id,
              message: error.message || 'Image generation failed',
            });
          }
        }

        send(controller, { type: 'complete', savedCount, failedCount });
      } catch (error: any) {
        console.error('[blog/bulk-images]', error);
        send(controller, { type: 'fatal', message: error.message || 'Bulk image regeneration failed' });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}