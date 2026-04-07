import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOPIC_SYSTEM = `You are a pest control content strategist for Absolute Pest Services, a professional pest and wildlife control company serving southeastern Pennsylvania (Chester County, Delaware County, Montgomery County, Philadelphia suburbs) and Delaware.

Generate 6 blog post topic ideas that provide real value to SE PA homeowners. Today is early spring — mix timely seasonal topics with evergreen guides. Vary the pest types and article styles.

Return ONLY a JSON object with key "topics" containing an array of exactly 6 objects:
{
  "title": "engaging, specific, SEO-friendly title",
  "category": "one of: Wildlife Control | Termites | Stinging Insects | Rodents | Bed Bugs | General Pests | Seasonal Tips",
  "angle": "1-2 sentences describing the article's angle and key takeaways for SE PA homeowners",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "imagePrompt": "detailed FLUX/DALL-E image prompt for the hero image — photorealistic, outdoor or home setting, southeastern Pennsylvania, no text, no logos, 16:9"
}

Required mix:
- At least 1 stinging insects (bees/wasps/hornets)
- At least 1 wildlife (raccoons/groundhogs/skunks/bats)
- At least 1 rodents (mice/rats)
- At least 1 spring seasonal
- At least 1 evergreen how-to
- At least 1 termites or bed bugs`;

export async function POST(_req: NextRequest) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TOPIC_SYSTEM },
        { role: 'user', content: 'Generate the 6 blog post topic ideas now.' },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 1800,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const topics: any[] = parsed.topics ?? (Array.isArray(parsed) ? parsed : Object.values(parsed)[0] as any[]);

    if (!Array.isArray(topics) || topics.length === 0) {
      return Response.json({ error: 'Failed to generate topics' }, { status: 500 });
    }

    return Response.json({ topics: topics.slice(0, 6) });
  } catch (err: any) {
    return Response.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
