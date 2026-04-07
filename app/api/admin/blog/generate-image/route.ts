import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { saveBase64ImageToDisk } from '@/lib/blog-image';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INFERENCE_API = 'https://api.inference.sh/apps/run';
const FLUX_APP = 'falai/flux-dev-lora';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const GEMINI_IMAGE_MODEL = 'google/gemini-2.5-flash-image';

// ─── Step 1: craft a focused prompt using GPT ─────────────────────────────────

async function buildAIImagePrompt(title: string, category: string, excerpt?: string): Promise<string> {
  const context = excerpt
    ? `Title: ${title}\nCategory: ${category}\nSummary: ${excerpt}`
    : `Title: ${title}\nCategory: ${category}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You write photorealistic image generation prompts for pest control blog hero images.
Given the blog's title, category, and summary, write a single descriptive prompt that:
- Depicts the specific pest, situation, or solution described in the article
- Is set in a southeastern Pennsylvania residential/suburban context
- Is wide landscape orientation (16:9)
- Has NO text, NO watermarks, NO logos, NO human faces
- Is vivid, specific, and photorealistic — not generic
Return ONLY the prompt, nothing else.`,
        },
        { role: 'user', content: context },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() ??
      `${title}, pest control, southeastern Pennsylvania suburban home, photorealistic, no text`;
  } catch {
    return `${category} pest control, southeastern Pennsylvania suburban home, photorealistic editorial photography, no text`;
  }
}

// ─── Step 2: generate image — Gemini → DALL-E 3 → FLUX ───────────────────────

async function tryGeminiOpenRouter(prompt: string, slugHint: string): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://absolutepestservices.com',
        'X-Title': 'Absolute Pest Services Blog',
      },
      body: JSON.stringify({
        model: GEMINI_IMAGE_MODEL,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image'],
        max_tokens: 4000,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[generate-image] Gemini failed:', res.status, err?.error?.message);
      return null;
    }
    const data = await res.json();
    const raw: string | null = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
    if (!raw) return null;
    if (raw.startsWith('data:')) {
      return saveBase64ImageToDisk(raw, slugHint);
    }
    return raw;
  } catch (err: any) {
    console.warn('[generate-image] Gemini error:', err.message);
    return null;
  }
}

async function tryDalle3(prompt: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });
    return response.data?.[0]?.url ?? null;
  } catch (err: any) {
    console.warn('[generate-image] DALL-E 3 failed:', err.message);
    return null;
  }
}

async function tryFlux(prompt: string): Promise<string | null> {
  const key = process.env.INFERENCESH_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(INFERENCE_API, {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: FLUX_APP, input: { prompt, num_images: 1, image_size: 'landscape_16_9' } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const images = data?.images ?? data?.output?.images ?? data?.data?.images ?? [];
    return images[0]?.url ?? images[0] ?? null;
  } catch (err: any) {
    console.warn('[generate-image] FLUX error:', err.message);
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { title, category, excerpt } = await req.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const prompt = await buildAIImagePrompt(title, category ?? 'General Pests', excerpt);
    const slugHint = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let imageUrl: string | null = null;
    let source = '';

    imageUrl = await tryGeminiOpenRouter(prompt, slugHint);
    if (imageUrl) { source = 'gemini-2.5-flash'; }

    if (!imageUrl) {
      imageUrl = await tryDalle3(prompt);
      if (imageUrl) source = 'dalle3';
    }

    if (!imageUrl) {
      imageUrl = await tryFlux(prompt);
      if (imageUrl) source = 'flux';
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'All image providers failed. Check API keys and credits.' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl, source, prompt });
  } catch (err: any) {
    console.error('[blog/generate-image]', err);
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 });
  }
}
