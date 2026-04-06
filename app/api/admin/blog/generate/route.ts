import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, category, excerpt } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert content writer for Absolute Pest Services, a pest and wildlife control company serving southeastern Pennsylvania (Chester County, Delaware County, Montgomery County, Philadelphia) and Delaware. Write authoritative, helpful blog content that:
- Speaks directly to PA and DE homeowners
- References local context naturally (e.g. PA bat exclusion laws, Chester County, Brandywine Valley, Delaware seasons) where relevant
- Is warm and trustworthy — never alarmist or salesy
- Uses clear headings and lists so it scans well
- Ends with a subtle call to action mentioning Absolute Pest Services

Return ONLY valid JSON with this exact structure:
{
  "content": "<full HTML blog post using <h2>, <h3>, <p>, <ul>, <li> tags — 600 to 900 words>",
  "excerpt": "<2 sentence summary, max 180 chars>",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "metaTitle": "<SEO title under 60 chars>",
  "metaDescription": "<SEO description 120-155 chars>"
}`;

    const userPrompt = `Write a blog post titled: "${title}"${category ? `\nCategory: ${category}` : ''}${excerpt ? `\nHint/excerpt to build from: ${excerpt}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

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
