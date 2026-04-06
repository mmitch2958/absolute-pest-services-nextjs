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

// Map inference.sh size strings to DALL-E 3 supported sizes
function dalleSize(size: string): '1024x1024' | '1792x1024' | '1024x1792' {
  if (size === 'landscape_16_9') return '1792x1024';
  if (size === 'portrait_9_16') return '1024x1792';
  return '1024x1024';
}

async function generateImage(prompt: string, size = 'landscape_16_9'): Promise<{ url: string; source: string } | null> {
  // 1. Try inference.sh FLUX
  const inferenceKey = process.env.INFERENCESH_API_KEY;
  if (inferenceKey) {
    try {
      const res = await fetch(INFERENCE_API, {
        method: 'POST',
        headers: { 'x-api-key': inferenceKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: FLUX_APP, input: { prompt, num_images: 1, image_size: size } }),
      });
      if (res.ok) {
        const data = await res.json();
        const images = data?.images ?? data?.output?.images ?? data?.data?.images ?? [];
        const url = images[0]?.url ?? images[0] ?? null;
        if (url) return { url, source: 'flux' };
      }
    } catch { /* fall through */ }
  }

  // 2. Fallback: DALL-E 3 via OpenAI
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${prompt}. No text, no watermarks, no logos. Photorealistic style.`,
      n: 1,
      size: dalleSize(size),
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

// ─── topic generation ─────────────────────────────────────────────────────────

const TOPIC_SYSTEM = `You are a pest control content strategist for Absolute Pest Services, a professional pest and wildlife control company serving southeastern Pennsylvania (Chester County, Delaware County, Montgomery County, Philadelphia suburbs) and Delaware.

Generate 6 blog post topics that provide real value to SE PA homeowners. Vary the pest types and article styles. Since it is early spring, mix timely seasonal topics with evergreen guides.

Return ONLY a JSON array of exactly 6 objects with this structure:
{
  "title": "engaging, specific, SEO-friendly title",
  "category": "one of: Wildlife Control | Termites | Stinging Insects | Rodents | Bed Bugs | General Pests | Seasonal Tips",
  "angle": "1-2 sentences on the article angle and main points to cover",
  "imagePrompts": {
    "hero": "detailed FLUX image prompt for the hero/featured image — photorealistic, 16:9, no text",
    "inline1": "detailed FLUX image prompt for first inline image — photorealistic, no text",
    "inline2": "detailed FLUX image prompt for second inline image — photorealistic, no text"
  },
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}

Mix of required topics:
- At least 1 about stinging insects (bees/wasps/hornets)
- At least 1 about wildlife (raccoons/groundhogs/skunks/bats)
- At least 1 about rodents (mice/rats)
- At least 1 spring seasonal alert
- At least 1 evergreen how-to guide
- At least 1 about termites or bed bugs`;

// ─── content generation ───────────────────────────────────────────────────────

function contentPrompt(topic: { title: string; category: string; angle: string; seoKeywords: string[] }): string {
  return `Write a complete, SEO-optimized blog post for Absolute Pest Services.

Title: ${topic.title}
Category: ${topic.category}
Angle: ${topic.angle}
Target keywords: ${topic.seoKeywords.join(', ')}

Requirements:
- 700–950 words of high-quality HTML content (use <h2>, <h3>, <p>, <ul>, <li>, <strong>)
- Two <!-- IMAGE_PLACEHOLDER --> comments placed naturally within the content where inline images will be inserted
- Write for southeastern PA homeowners — reference local context (Chester County, Delaware, seasonal timing, PA wildlife laws where relevant)
- End with a call to action mentioning Absolute Pest Services, phone 484-643-2225
- Authoritative, warm, helpful tone — never alarmist or salesy

Return ONLY valid JSON with this exact structure:
{
  "content": "<full HTML with two <!-- IMAGE_PLACEHOLDER --> markers>",
  "excerpt": "compelling 1-2 sentence summary under 180 chars",
  "metaTitle": "SEO title under 60 chars",
  "metaDescription": "SEO description 120–155 chars",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;
}

// ─── main handler ─────────────────────────────────────────────────────────────

export async function POST(_req: NextRequest) {
  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        send(ctrl, { type: 'start', message: 'Researching SE PA pest control topics…' });

        // Step 1: generate 6 topics
        const topicCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: TOPIC_SYSTEM }, { role: 'user', content: 'Generate the 6 blog post topics now.' }],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 2000,
        });

        const topicRaw = topicCompletion.choices[0]?.message?.content ?? '{}';
        const topicParsed = JSON.parse(topicRaw);
        const topics: any[] = Array.isArray(topicParsed) ? topicParsed : (topicParsed.topics ?? topicParsed.posts ?? Object.values(topicParsed)[0]);

        if (!Array.isArray(topics) || topics.length === 0) {
          send(ctrl, { type: 'error', message: 'Failed to generate topics' });
          ctrl.close();
          return;
        }

        send(ctrl, { type: 'topics_ready', count: topics.length, titles: topics.map((t) => t.title) });

        const savedPosts: { id: number; title: string; slug: string }[] = [];

        // Step 2: process each topic
        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i];
          send(ctrl, { type: 'post_start', index: i, title: topic.title, category: topic.category });

          try {
            // 2a. generate content
            send(ctrl, { type: 'post_writing', index: i });
            const contentCompletion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: contentPrompt(topic) }],
              response_format: { type: 'json_object' },
              temperature: 0.7,
              max_tokens: 2500,
            });

            const contentRaw = contentCompletion.choices[0]?.message?.content ?? '{}';
            const contentData = JSON.parse(contentRaw);
            if (!contentData.content) throw new Error('No content returned');

            // 2b. generate images (FLUX → DALL-E 3 fallback)
            send(ctrl, { type: 'post_images', index: i, imageIndex: 0 });
            const heroResult = await generateImage(topic.imagePrompts?.hero ?? `${topic.category} pest control, southeastern Pennsylvania, photorealistic`, 'landscape_16_9');
            if (heroResult) send(ctrl, { type: 'post_image_done', index: i, imageIndex: 0, source: heroResult.source });

            send(ctrl, { type: 'post_images', index: i, imageIndex: 1 });
            const inline1Result = await generateImage(topic.imagePrompts?.inline1 ?? `${topic.title} close-up, photorealistic`, 'square_hd');
            if (inline1Result) send(ctrl, { type: 'post_image_done', index: i, imageIndex: 1, source: inline1Result.source });

            send(ctrl, { type: 'post_images', index: i, imageIndex: 2 });
            const inline2Result = await generateImage(topic.imagePrompts?.inline2 ?? `home pest prevention, southeastern Pennsylvania, photorealistic`, 'landscape_16_9');
            if (inline2Result) send(ctrl, { type: 'post_image_done', index: i, imageIndex: 2, source: inline2Result.source });

            // 2c. weave inline images into content
            let finalContent = contentData.content as string;
            let imagesInserted = 0;
            finalContent = finalContent.replace(/<!--\s*IMAGE_PLACEHOLDER\s*-->/g, () => {
              imagesInserted++;
              const result = imagesInserted === 1 ? inline1Result : inline2Result;
              if (!result?.url) return '';
              return `<figure style="margin:2rem 0;"><img src="${result.url}" alt="${topic.title}" style="width:100%;border-radius:12px;object-fit:cover;" loading="lazy" /></figure>`;
            });

            // 2d. save to DB
            send(ctrl, { type: 'post_saving', index: i });
            const slug = await uniqueSlug(slugify(topic.title));
            const tags = Array.isArray(contentData.tags) ? contentData.tags : (topic.seoKeywords ?? []);

            const rows = await sql`
              INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, featured_image, meta_title, meta_description, is_published, created_at, updated_at)
              VALUES (
                ${topic.title},
                ${slug},
                ${contentData.excerpt ?? ''},
                ${finalContent},
                ${'Absolute Pest Services'},
                ${topic.category},
                ${tags},
                ${heroResult?.url ?? null},
                ${contentData.metaTitle ?? topic.title},
                ${contentData.metaDescription ?? contentData.excerpt ?? ''},
                ${false},
                NOW(),
                NOW()
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
              hasHeroImage: !!heroResult,
              inlineImages: [inline1Result, inline2Result].filter(Boolean).length,
            });
          } catch (postErr: any) {
            send(ctrl, { type: 'post_error', index: i, title: topic.title, message: postErr.message ?? 'Unknown error' });
          }
        }

        send(ctrl, { type: 'complete', savedCount: savedPosts.length, posts: savedPosts });
      } catch (err: any) {
        send(ctrl, { type: 'fatal', message: err.message ?? 'Batch generation failed' });
      } finally {
        ctrl.close();
      }
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
