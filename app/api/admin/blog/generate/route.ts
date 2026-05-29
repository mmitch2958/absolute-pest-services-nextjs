import { NextRequest, NextResponse } from 'next/server';
import { BLOG_TEXT_MODEL, getOpenAIClient, requireAdminJson, withTimeout } from '@/lib/admin-ai';

export async function POST(req: NextRequest) {
  const authError = await requireAdminJson();
  if (authError) return authError;

  try {
    const { title, category, excerpt } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert content writer for Absolute Pest Services, a pest and wildlife control company serving southeastern Pennsylvania (Chester County, Delaware County, Montgomery County, Philadelphia suburbs) and Delaware. Write authoritative, helpful blog content that:
- Speaks directly to PA and DE homeowners
- References local context naturally (e.g. PA bat exclusion laws, Chester County, Brandywine Valley, Delaware seasons) where relevant
- Is warm and trustworthy — never alarmist or salesy
- Uses short sections, answer-first paragraphs, local examples, and lists so it scans well
- Includes one practical checklist or "what to do next" block
- Avoids generic filler, keyword stuffing, and unsupported claims
- Ends with a subtle call to action mentioning Absolute Pest Services

Return ONLY valid JSON with this exact structure:
{
  "content": "<full HTML blog post using <h2>, <h3>, <p>, <ul>, <li>, <strong> tags — 650 to 950 words>",
  "excerpt": "<2 sentence summary, max 180 chars>",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "metaTitle": "<SEO title under 60 chars>",
  "metaDescription": "<SEO description 120-155 chars>"
}`;

    const userPrompt = `Write a blog post titled: "${title}"${category ? `\nCategory: ${category}` : ''}${excerpt ? `\nHint/excerpt to build from: ${excerpt}` : ''}`;

    const openai = getOpenAIClient();
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: BLOG_TEXT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.65,
        max_tokens: 2400,
      }),
      35000,
      'Blog generation',
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('No response from AI');

    const parsed = JSON.parse(raw);

    if (!parsed.content || !parsed.excerpt) {
      throw new Error('AI response missing required fields');
    }

    return NextResponse.json({
      content: parsed.content,
      excerpt: parsed.excerpt,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      metaTitle: parsed.metaTitle || '',
      metaDescription: parsed.metaDescription || '',
    });
  } catch (err: any) {
    console.error('[blog/generate]', err);
    return NextResponse.json(
      { error: err.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}
