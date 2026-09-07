import { sql } from '@/lib/db';
import { generateBlogImage } from '@/lib/blog-image-generation';

export interface SupportingBlogImage {
  imageUrl: string;
  altText: string;
  sectionHeading: string;
  sortOrder: number;
  source: string;
}

interface BlogArticle {
  title: string;
  category: string;
  excerpt: string;
  content: string;
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function articleSections(article: BlogArticle) {
  const matches = [...article.content.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const sections = matches
    .map((match, index) => {
      const heading = plainText(match[1]);
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[index + 1]?.index ?? article.content.length;
      return {
        heading,
        summary: plainText(article.content.slice(start, end)).slice(0, 520),
      };
    })
    .filter(section =>
      section.heading &&
      section.summary &&
      !/(contact|call today|schedule|conclusion|final thoughts)/i.test(section.heading),
    );

  if (sections.length >= 2) return sections.slice(0, 3);

  return [
    {
      heading: `Understanding ${article.category}`,
      summary: article.excerpt || plainText(article.content).slice(0, 520),
    },
    {
      heading: 'What homeowners should look for',
      summary: plainText(article.content).slice(350, 870) || article.excerpt,
    },
    {
      heading: 'Prevention and professional guidance',
      summary: plainText(article.content).slice(-520) || article.excerpt,
    },
  ].slice(0, 3);
}

export async function generateSupportingBlogImages(article: BlogArticle): Promise<SupportingBlogImage[]> {
  const sections = articleSections(article);
  const results = await Promise.allSettled(
    sections.map(async (section, index) => {
      const result = await generateBlogImage(
        `${article.title}: ${section.heading}`,
        article.category,
        section.summary,
        { kind: 'supporting', slugSuffix: `section-${index + 1}` },
      );

      return {
        imageUrl: result.imageUrl,
        altText: `${section.heading} — ${article.title}`,
        sectionHeading: section.heading,
        sortOrder: index,
        source: result.source,
      };
    }),
  );

  const images: SupportingBlogImage[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') images.push(result.value);
  }
  return images;
}

export async function replaceSupportingBlogImages(postId: number, images: SupportingBlogImage[]) {
  if (images.length === 0) return;

  const payload = JSON.stringify(images.map(image => ({
    image_url: image.imageUrl,
    alt_text: image.altText,
    section_heading: image.sectionHeading,
    sort_order: image.sortOrder,
  })));

  await sql`
    WITH removed AS (
      DELETE FROM blog_post_images WHERE post_id = ${postId}
    )
    INSERT INTO blog_post_images (post_id, image_url, alt_text, section_heading, sort_order)
    SELECT
      ${postId},
      item.image_url,
      item.alt_text,
      item.section_heading,
      item.sort_order
    FROM jsonb_to_recordset(${payload}::jsonb) AS item(
      image_url text,
      alt_text text,
      section_heading text,
      sort_order integer
    )
  `;
}