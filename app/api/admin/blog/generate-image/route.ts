import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INFERENCE_API = 'https://api.inference.sh/apps/run';
const FLUX_APP = 'falai/flux-dev-lora';

function buildImagePrompt(title: string, category: string): string {
  const categoryPrompts: Record<string, string> = {
    'Wildlife Control': 'wildlife animal removal, suburban Pennsylvania home exterior, professional wildlife control',
    'Bed Bugs': 'close-up bed bug inspection, clean white bedding, professional pest inspection',
    'Termites': 'termite damage on wood, home foundation inspection, Pennsylvania residential',
    'Rodents': 'mouse or rat in home, residential pest control, suburban Pennsylvania',
    'Seasonal Tips': 'home exterior pest prevention, Pennsylvania suburban neighborhood, seasonal',
    'Ants': 'ant infestation close-up, kitchen or home interior, pest control inspection',
    'Stinging Insects': 'wasp or bee nest on home exterior, professional pest removal',
    'Mosquitoes': 'mosquito control treatment, suburban backyard Pennsylvania summer',
  };
  const hint = categoryPrompts[category] ?? 'pest control professional inspection, suburban Pennsylvania home';
  return `${hint}, photorealistic, professional editorial photography, bright natural lighting, high detail, 16:9 wide angle, no text, no logos`;
}

export async function POST(req: NextRequest) {
  try {
    const { title, category } = await req.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const prompt = buildImagePrompt(title, category ?? '');
    let imageUrl: string | null = null;
    let source = '';

    // 1. Try DALL-E 3 first (most reliable)
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: `${prompt}. No watermarks, no text overlays.`,
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

    // 2. Fallback: inference.sh FLUX
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

    return NextResponse.json({ imageUrl, source });
  } catch (err: any) {
    console.error('[blog/generate-image]', err);
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 });
  }
}
