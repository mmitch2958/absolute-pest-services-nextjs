/**
 * AI blog content is expected to contain only simple article markup. Remove
 * presentation attributes so generated white text or utility classes cannot
 * override the site's readable blog palette.
 */
export function normalizeBlogHtml(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|svg)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|svg)\b[^>]*\/?>/gi, '')
    .replace(/\s+(?:style|class|color|bgcolor|on[a-z-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}