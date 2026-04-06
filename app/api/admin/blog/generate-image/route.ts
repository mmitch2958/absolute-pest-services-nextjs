import { NextRequest, NextResponse } from 'next/server';

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

  const categoryHint = categoryPrompts[category] ?? 'pest control professional inspection, suburban Pennsylvania home';

  return `${categoryHint}, photorealistic, professional editorial photography, bright natural lighting, high detail, 16:9 wide angle, no text, no logos`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.INFERENCESH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 });
  }

  try {
    const { title, category } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const prompt = buildImagePrompt(title, category ?? '');

    const res = await fetch(INFERENCE_API, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app: FLUX_APP,
        input: {
          prompt,
          num_images: 1,
          image_size: 'landscape_16_9',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data?.error?.code ?? 'unknown';
      const msg = data?.error?.message ?? 'Image generation failed';

      if (res.status === 402) {
        return NextResponse.json(
          { error: 'Insufficient inference.sh credits. Add credits at inference.sh to enable image generation.' },
          { status: 402 }
        );
      }
      return NextResponse.json({ error: `${msg} (${code})` }, { status: res.status });
    }

    // Response: { images: [{ url, content_type }] } or { output: { images: [...] } }
    const images =
      data?.images ??
      data?.output?.images ??
      data?.data?.images ??
      [];

    const imageUrl = images[0]?.url ?? images[0];

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned from API' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err: any) {
    console.error('[blog/generate-image]', err);
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 });
  }
}
