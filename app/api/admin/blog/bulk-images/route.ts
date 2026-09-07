import { NextRequest } from 'next/server';
import { requireAdminJson } from '@/lib/admin-ai';
import { generateBlogImage } from '@/lib/blog-image-generation';
import { generateSupportingBlogImages, replaceSupportingBlogImages } from '@/lib/blog-supporting-images';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface BlogImageRow {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
}

function send(controller: ReadableStreamDefaultController, data: object) {
  try {
    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
    return true;
  } catch {
    return false;
  }
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

  let mode: 'missing' | 'selected' | 'supporting';
  let ids: number[];

  try {
    const body = await request.json();
    mode = body.mode === 'missing' ? 'missing' : body.mode === 'supporting' ? 'supporting' : 'selected';
    ids = normalizeIds(body.ids);
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (mode !== 'missing' && ids.length === 0) {
    return Response.json({ error: 'Select at least one blog post' }, { status: 400 });
  }
  if (mode === 'supporting' && ids.length > 10) {
    return Response.json({ error: 'Generate article images for up to 10 posts at a time' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        send(controller, { type: 'heartbeat' });
      }, 10000);

      try {
        const rows = mode === 'missing'
          ? await sql`
              SELECT id, title, category, excerpt, content
              FROM blog_posts
              WHERE featured_image IS NULL
                 OR BTRIM(featured_image) = ''
                 OR featured_image LIKE '/blog-images/%'
                 OR featured_image LIKE '/uploads/blog-images/%'
              ORDER BY created_at DESC
              LIMIT 100
            ` as BlogImageRow[]
          : await sql`
              SELECT id, title, category, excerpt, content
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
          if (!send(controller, { type: 'item_start', id: post.id })) break;

          try {
            let source: string;
            let imageCount = 1;

            if (mode === 'supporting') {
              const images = await generateSupportingBlogImages(post);
              if (images.length === 0) {
                throw new Error('No supporting images could be generated');
              }
              await replaceSupportingBlogImages(post.id, images);
              source = [...new Set(images.map(image => image.source))].join(', ');
              imageCount = images.length;
            } else {
              const image = await generateBlogImage(post.title, post.category, post.excerpt);
              await sql`
                UPDATE blog_posts
                SET featured_image = ${image.imageUrl}, updated_at = NOW()
                WHERE id = ${post.id}
              `;
              source = image.source;
            }

            savedCount++;
            send(controller, {
              type: 'item_success',
              id: post.id,
              source,
              imageCount,
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
        try {
          controller.close();
        } catch {
          // The browser disconnected and the stream is already closed.
        }
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