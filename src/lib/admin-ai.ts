import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

export const BLOG_TEXT_MODEL = 'gpt-4o-mini';
export const BLOG_IMAGE_PROMPT_MODEL = 'gpt-4o-mini';
export const BLOG_DALLE_MODEL = 'dall-e-3';
export const BLOG_OPENROUTER_IMAGE_MODEL = 'google/gemini-2.5-flash-image';

let openaiClient: OpenAI | null = null;

export async function requireAdminJson() {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 1,
    });
  }

  return openaiClient;
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function fetchJsonWithTimeout(url: string, init: RequestInit, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
