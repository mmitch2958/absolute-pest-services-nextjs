import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INFERENCE_API = 'https://api.inference.sh/apps/run';
const FLUX_APP = 'falai/flux-dev-lora';

// Use GPT to craft a precise DALL-E prompt from the article's actual content
async function buildAIImagePrompt(title: string, category: string, excerpt?: string): Promise<string> {
  const context = excerpt
    ? `Title: ${title}\nCategory: ${category}\nSummary: ${excerpt}`
    : `Title: ${title}\nCategory: ${category}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert at writing DALL-E 3 image generation prompts for pest control blog hero images.
Given a blog post's title, category, and summary, write a single photorealistic image prompt that:
- Depicts the specific subject of the article visually (the pest, the situation, the solution)
- Is set in a southeastern Pennsylvania residential or suburban context where appropriate
- Is photorealistic, professional editorial photography style
- Is wide-angle / landscape oriented (16:9)
- Contains NO text, NO watermarks, NO logos, NO people's faces
- Is vivid and specific — not generic
Return ONLY the image prompt text, nothing else.`,
      },
      { role: 'user', content: context },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() ??
    `${title}, pest control, southeastern Pennsylvania suburban home, photorealistic, professional editorial photography, no text`;
}

export async function POST(req: NextRequest) {
  try {
    const { title, category, excerpt } = await req.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    // Step 1: craft a relevant prompt from the article content
    const prompt = await buildAIImagePrompt(title, category ?? 'General Pests', excerpt);

    let imageUrl: string | null = null;
    let source = '';

    // Step 2: try DALL-E 3 first
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
        });
        imageUrl = response.data?.[0]?.url ?? null;
        if (imageUrl) source = 'dalle3';
      } catch (err: any) {
        console.warn('[generate-image] DALL-E 3 failed:', err.message);
      }
    }

    // Step 3: fallback to inference.sh FLUX
    if (!imageUrl) {
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
            imageUrl = images[0]?.url ?? images[0] ?? null;
            if (imageUrl) source = 'flux';
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn('[generate-image] inference.sh failed:', res.status, errData?.error?.message);
          }
        } catch (err: any) {
          console.warn('[generate-image] inference.sh error:', err.message);
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image generation failed — no provider returned an image.' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl, source, prompt });
  } catch (err: any) {
    console.error('[blog/generate-image]', err);
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 });
  }
}
