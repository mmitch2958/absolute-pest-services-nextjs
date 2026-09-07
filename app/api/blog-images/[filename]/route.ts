import { Client } from '@replit/object-storage';
import { NextResponse } from 'next/server';

const CONTENT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function imageContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!/^[a-z0-9][a-z0-9-]*\.(avif|gif|jpe?g|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  try {
    const result = await new Client().downloadAsBytes(`blog-images/${filename}`);
    if (!result.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(result.value[0]), {
      headers: {
        'Content-Type': imageContentType(filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[blog-images] download failed:', error);
    return NextResponse.json({ error: 'Unable to load image' }, { status: 500 });
  }
}