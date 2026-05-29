import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { saveBase64ImageToDisk } from '@/lib/blog-image';
import {
  BLOG_DALLE_MODEL,
  BLOG_IMAGE_PROMPT_MODEL,
  BLOG_OPENROUTER_IMAGE_MODEL,
  BLOG_TEXT_MODEL,
  fetchJsonWithTimeout,
  getOpenAIClient,
  requireAdminJson,
  withTimeout,
} from '@/lib/admin-ai';

export const dynamic = 'force-dynamic';

const INFERENCE_API = 'https://api.inference.sh/apps/run';
const FLUX_APP = 'falai/flux-dev-lora';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const IMAGE_TIMEOUT_MS = 22000;

// ─── helpers ─────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function send(ctrl: ReadableStreamDefaultController, data: object) {
  ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

type ImageStyle = 'realistic' | 'cartoon';

function styleModifier(style: ImageStyle): string {
  return style === 'cartoon'
    ? 'colorful digital illustration style, cartoon art, friendly and approachable, vibrant colors, clean lines, children-book illustration aesthetic'
    : 'photorealistic DSLR photography, natural lighting, sharp focus, suburban Pennsylvania residential setting';
}

async function generateHeroImage(
  prompt: string,
  slugHint: string,
  style: ImageStyle,
): Promise<{ url: string; source: string } | null> {
  const styledPrompt = `${prompt}. ${styleModifier(style)}. No text, no watermarks, no logos, wide landscape 16:9 format.`;

  // 1. Gemini 2.5 Flash via OpenRouter (returns base64 data URL — saved to disk)
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      const res = await fetchJsonWithTimeout(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${orKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://absolutepestservices.com',
          'X-Title': 'Absolute Pest Services Blog',
        },
        body: JSON.stringify({
          model: BLOG_OPENROUTER_IMAGE_MODEL,
          messages: [{ role: 'user', content: styledPrompt }],
          modalities: ['image'],
          max_tokens: 4000,
        }),
      }, IMAGE_TIMEOUT_MS);
      if (res.ok) {
        const data = await res.json();
        const raw: string | null = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
        if (raw) {
          const url = raw.startsWith('data:') ? saveBase64ImageToDisk(raw, slugHint) : raw;
          return { url, source: 'gemini-2.5-flash' };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('[ai-batch] Gemini failed:', res.status, errData?.error?.message);
      }
    } catch (err: any) {
      console.warn('[ai-batch] Gemini error:', err.message);
    }
  }

  // 2. Fallback: DALL-E 3 (returns HTTPS URL directly)
  try {
    const openai = getOpenAIClient();
    const response = await withTimeout(
      openai.images.generate({
        model: BLOG_DALLE_MODEL,
        prompt: styledPrompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      }),
      IMAGE_TIMEOUT_MS,
      'DALL-E image generation',
    );
    const url = response.data?.[0]?.url ?? null;
    if (url) return { url, source: 'dalle3' };
  } catch (err: any) {
    console.warn('[ai-batch] DALL-E 3 failed:', err.message);
  }

  // 3. Fallback: inference.sh FLUX (returns HTTPS URL directly)
  const inferenceKey = process.env.INFERENCESH_API_KEY;
  if (inferenceKey) {
    try {
      const res = await fetchJsonWithTimeout(INFERENCE_API, {
        method: 'POST',
        headers: { 'x-api-key': inferenceKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: FLUX_APP, input: { prompt: styledPrompt, num_images: 1, image_size: 'landscape_16_9' } }),
      }, IMAGE_TIMEOUT_MS);
      if (res.ok) {
        const data = await res.json();
        const images = data?.images ?? data?.output?.images ?? data?.data?.images ?? [];
        const url: string | null = images[0]?.url ?? images[0] ?? null;
        if (url) return { url, source: 'flux' };
      }
    } catch (err: any) {
      console.warn('[ai-batch] FLUX error:', err.message);
    }
  }

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
- Open with the direct answer or practical takeaway in the first paragraph
- Include one checklist, warning-sign list, or "what to do next" section
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
  const authError = await requireAdminJson();
  if (authError) return authError;

  let selectedTopics: any[] = [];
  let includeImages = true;

  try {
    const body = await req.json();
    selectedTopics = Array.isArray(body.topics) ? body.topics : [];
    includeImages = body.includeImages !== false;
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  if (selectedTopics.length === 0) {
    return new Response('No topics provided', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(ctrl) {
      const total = selectedTopics.length;
      send(ctrl, { type: 'start', total, message: `Creating ${total} blog post${total !== 1 ? 's' : ''}${includeImages ? ' with hero images' : ''}…` });

      const savedPosts: { id: number; title: string; slug: string }[] = [];

      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i];
        send(ctrl, { type: 'post_start', index: i, total, title: topic.title, category: topic.category });

        try {
          // Step A: write content
          send(ctrl, { type: 'post_writing', index: i });
          const openai = getOpenAIClient();
          const completion = await withTimeout(
            openai.chat.completions.create({
              model: BLOG_TEXT_MODEL,
              messages: [{ role: 'user', content: contentPrompt(topic) }],
              response_format: { type: 'json_object' },
              temperature: 0.65,
              max_tokens: 2800,
            }),
            40000,
            'Blog post generation',
          );

          const raw = completion.choices[0]?.message?.content ?? '{}';
          const contentData = JSON.parse(raw);
          if (!contentData.content) throw new Error('No content returned from AI');

          const slugHint = slugify(topic.title);
          let imageResult: { url: string; source: string } | null = null;
          let imageStyle: ImageStyle = 'realistic';
          let imagePrompt = topic.imagePrompt ?? '';

          if (includeImages) {
            // Step B: craft a focused image prompt from the actual article content, then generate.
            // Image generation is optional and timeout-bound so a slow provider cannot block publishing.
            send(ctrl, { type: 'post_image', index: i });
            imageStyle = 'realistic';
            try {
              const imgPromptCompletion = await withTimeout(
                openai.chat.completions.create({
                  model: BLOG_IMAGE_PROMPT_MODEL,
                  messages: [
                    {
                      role: 'system',
                      content: 'Write one photorealistic pest control blog hero image prompt showing the specific pest, home setting, or solution in southeastern Pennsylvania. No text, no watermarks, no logos. Return only the image subject description.',
                    },
                    {
                      role: 'user',
                      content: `Title: ${topic.title}\nCategory: ${topic.category}\nSummary: ${contentData.excerpt ?? topic.angle}`,
                    },
                  ],
                  max_tokens: 180,
                  temperature: 0.65,
                }),
                12000,
                'Image prompt generation',
              );
              imagePrompt = imgPromptCompletion.choices[0]?.message?.content?.trim() ?? imagePrompt;
            } catch { /* keep existing prompt on failure */ }

            imageResult = await withTimeout(
              generateHeroImage(
                imagePrompt || `${topic.category} pest control scene, southeastern Pennsylvania suburban home`,
                slugHint,
                imageStyle,
              ),
              50000,
              'Hero image generation',
            ).catch((err) => {
              console.warn('[ai-batch] image skipped:', err.message);
              return null;
            });
            if (imageResult) send(ctrl, { type: 'post_image_done', index: i, source: imageResult.source, style: imageStyle });
          }

          // Step C: save to DB as published, even if image generation was skipped or failed.
          send(ctrl, { type: 'post_saving', index: i });
          const slug = await uniqueSlug(slugHint);
          const tags = Array.isArray(contentData.tags) ? contentData.tags : (topic.seoKeywords ?? []);

          const rows = await sql`
            INSERT INTO blog_posts (
              title, slug, excerpt, content, author, category, tags,
              featured_image, meta_title, meta_description,
              is_published, published_at, created_at, updated_at
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
              ${true},
              NOW(), NOW(), NOW()
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
          console.error('[ai-batch] post error:', err);
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
