import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const INFERENCE_API = 'https://api.inference.sh/apps/run';
const FLUX_APP = 'falai/flux-dev-lora';

// ─── helpers ─────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function send(ctrl: ReadableStreamDefaultController, data: object) {
  ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

async function generateHeroImage(prompt: string): Promise<{ url: string; source: string } | null> {
  // 1. Try inference.sh FLUX
  const inferenceKey = process.env.INFERENCESH_API_KEY;
  if (inferenceKey) {
    try {
      const res = await fetch(INFERENCE_API, {
        method: 'POST',
        headers: { 'x-api-key': inferenceKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: FLUX_APP, input: { prompt, num_images: 1, image_size: 'landscape_16_9' } }),
      });
      if (res.ok) {
        const data = await res.json();
        const images = data?.images ?? data?.output?.images ?? data?.data?.images ?? [];
        const url: string | null = images[0]?.url ?? images[0] ?? null;
        if (url) return { url, source: 'flux' };
      }
    } catch { /* fall through */ }
  }

  // 2. Fallback: DALL-E 3
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${prompt}. No text, no watermarks, no logos. Photorealistic photography style.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });
    const url = response.data?.[0]?.url ?? null;
    if (url) return { url, source: 'dalle3' };
  } catch { /* fall through */ }

  return null;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const rows = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

// ─── content prompt ───────────────────────────────────────────────────────────

function contentPrompt(topic: { title: string; category: string; angle: string; seoKeywords: string[] }): string {
  return `Write a complete, SEO-optimized blog post for Absolute Pest Services.

Title: ${topic.title}
Category: ${topic.category}
Angle: ${topic.angle}
Target keywords: ${topic.seoKeywords?.join(', ') ?? ''}

Requirements:
- 700–950 words of high-quality HTML content
- Use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags appropriately
- Reference southeastern PA context (Chester County, Delaware County, seasonal timing, PA/DE specific where relevant)
- End with a call to action mentioning Absolute Pest Services and phone 484-643-2225
- Authoritative, warm, helpful tone — not alarmist or overly salesy
- NO image placeholders or image tags — hero image is handled separately

Return ONLY valid JSON with this exact structure:
{
  "content": "<full HTML article>",
  "excerpt": "compelling 1-2 sentence summary under 180 chars",
  "metaTitle": "SEO title under 60 chars",
  "metaDescription": "SEO description 120–155 chars",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;
}

// ─── main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let selectedTopics: any[] = [];

  try {
    const body = await req.json();
    selectedTopics = Array.isArray(body.topics) ? body.topics : [];
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  if (selectedTopics.length === 0) {
    return new Response('No topics provided', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(ctrl) {
      const total = selectedTopics.length;
      send(ctrl, { type: 'start', total, message: `Creating ${total} blog post${total !== 1 ? 's' : ''}…` });

      const savedPosts: { id: number; title: string; slug: string }[] = [];

      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i];
        send(ctrl, { type: 'post_start', index: i, total, title: topic.title, category: topic.category });

        try {
          // Step A: write content
          send(ctrl, { type: 'post_writing', index: i });
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: contentPrompt(topic) }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2500,
          });

          const raw = completion.choices[0]?.message?.content ?? '{}';
          const contentData = JSON.parse(raw);
          if (!contentData.content) throw new Error('No content returned from AI');

          // Step B: generate 1 hero image
          send(ctrl, { type: 'post_image', index: i });
          const imageResult = await generateHeroImage(
            topic.imagePrompt ?? `${topic.category} pest control, southeastern Pennsylvania suburban home, professional, photorealistic, no text`
          );
          if (imageResult) send(ctrl, { type: 'post_image_done', index: i, source: imageResult.source });

          // Step C: save to DB as draft
          send(ctrl, { type: 'post_saving', index: i });
          const slug = await uniqueSlug(slugify(topic.title));
          const tags = Array.isArray(contentData.tags) ? contentData.tags : (topic.seoKeywords ?? []);

          const rows = await sql`
            INSERT INTO blog_posts (
              title, slug, excerpt, content, author, category, tags,
              featured_image, meta_title, meta_description,
              is_published, created_at, updated_at
            ) VALUES (
              ${topic.title},
              ${slug},
              ${contentData.excerpt ?? ''},
              ${contentData.content},
              ${'Absolute Pest Services'},
              ${topic.category},
              ${tags},
              ${imageResult?.url ?? null},
              ${contentData.metaTitle ?? topic.title},
              ${contentData.metaDescription ?? contentData.excerpt ?? ''},
              ${false},
              NOW(), NOW()
            )
            RETURNING id, title, slug
          `;

          const saved = rows[0] as { id: number; title: string; slug: string };
          savedPosts.push(saved);

          send(ctrl, {
            type: 'post_saved',
            index: i,
            id: saved.id,
            title: saved.title,
            slug: saved.slug,
            hasImage: !!imageResult,
            imageSource: imageResult?.source ?? null,
          });

        } catch (err: any) {
          send(ctrl, { type: 'post_error', index: i, title: topic.title, message: err.message ?? 'Unknown error' });
        }
      }

      send(ctrl, { type: 'complete', savedCount: savedPosts.length, posts: savedPosts });
      ctrl.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
