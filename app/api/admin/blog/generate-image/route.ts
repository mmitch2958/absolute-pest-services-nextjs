import { NextRequest, NextResponse } from 'next/server';
import { requireAdminJson } from '@/lib/admin-ai';
import { generateBlogImage } from '@/lib/blog-image-generation';

export async function POST(request: NextRequest) {
  const authError = await requireAdminJson();
  if (authError) return authError;

  try {
    const { title, category, excerpt } = await request.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const result = await generateBlogImage(title.trim(), category?.trim() || 'General Pests', excerpt?.trim());
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[blog/generate-image]', error);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}