import path from 'path';
import { Client } from '@replit/object-storage';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function safeSlug(slugHint: string): string {
  return slugHint
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'blog-image';
}

function imageExtension(mimeType: string, sourceUrl?: string): string {
  const normalizedMime = mimeType.split(';')[0].trim().toLowerCase();
  if (MIME_TO_EXT[normalizedMime]) return MIME_TO_EXT[normalizedMime];

  if (sourceUrl) {
    try {
      const extension = path.extname(new URL(sourceUrl).pathname).replace('.', '').toLowerCase();
      if (['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        return extension === 'jpeg' ? 'jpg' : extension;
      }
    } catch {
      // Fall through to the explicit error below.
    }
  }

  throw new Error(`Unsupported blog image type: ${mimeType || 'unknown'}`);
}

async function writeImageToStorage(buffer: Buffer, mimeType: string, slugHint: string, sourceUrl?: string): Promise<string> {
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Blog image is larger than the 15 MB limit');
  }

  const ext = imageExtension(mimeType, sourceUrl);
  const filename = `${Date.now()}-${safeSlug(slugHint)}.${ext}`;
  const objectName = `blog-images/${filename}`;
  const result = await new Client().uploadFromBytes(objectName, buffer, { compress: false });

  if (!result.ok) {
    throw new Error(`Image upload failed: ${result.error.message}`);
  }

  return `/api/blog-images/${filename}`;
}

/**
 * Decode a base64 data URL and upload it to durable App Storage.
 * Returns the public image route (e.g. /api/blog-images/1234-slug.png).
 * Providers like Gemini return base64 PNGs.
 */
export async function saveBase64ImageToStorage(dataUrl: string, slugHint: string): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) throw new Error('Invalid base64 data URL');
  return writeImageToStorage(Buffer.from(match[2], 'base64'), match[1], slugHint);
}

/** Returns true when a string is a base64 data URL rather than an HTTP URL. */
export function isBase64DataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Persist a generated or user-provided remote image in App Storage before storing it.
 * Provider URLs (especially DALL-E URLs) are temporary and should never be the
 * canonical URL in the blog database.
 */
export async function saveImageUrlToStorage(imageUrl: string, slugHint: string): Promise<string> {
  if (isBase64DataUrl(imageUrl)) {
    return saveBase64ImageToStorage(imageUrl, slugHint);
  }

  if (!/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { Accept: 'image/avif,image/webp,image/jpeg,image/png,image/*' },
    });

    if (!response.ok) {
      throw new Error(`Image download failed with status ${response.status}`);
    }

    const mimeType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      throw new Error('Blog image is larger than the 15 MB limit');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return writeImageToStorage(buffer, mimeType, slugHint, imageUrl);
  } finally {
    clearTimeout(timer);
  }
}
