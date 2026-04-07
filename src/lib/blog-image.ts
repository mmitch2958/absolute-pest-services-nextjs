import path from 'path';
import fs from 'fs';

/**
 * Decode a base64 data URL and write it to public/blog-images/.
 * Returns the relative URL path (e.g. /blog-images/1234-slug.png).
 * Providers like Gemini return base64 PNGs; DALL-E 3 / FLUX return HTTPS URLs.
 * Call this before storing in the DB to stay under Neon HTTP's per-param limit.
 */
export function saveBase64ImageToDisk(dataUrl: string, slugHint: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) throw new Error('Invalid base64 data URL');
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };
  const ext = mimeToExt[match[1]] ?? 'png';
  const safeSlug = slugHint
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  const filename = `${Date.now()}-${safeSlug}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'blog-images');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), Buffer.from(match[2], 'base64'));
  return `/blog-images/${filename}`;
}

/** Returns true when a string is a base64 data URL rather than an HTTP URL. */
export function isBase64DataUrl(url: string): boolean {
  return url.startsWith('data:');
}
