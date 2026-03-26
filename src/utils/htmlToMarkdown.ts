export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  md = md.replace(/<br\s*\/?>/gi, '\n');

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => `# ${stripTags(content)}\n\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => `## ${stripTags(content)}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => `### ${stripTags(content)}\n\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, content) => `#### ${stripTags(content)}\n\n`);
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, content) => `##### ${stripTags(content)}\n\n`);
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, content) => `###### ${stripTags(content)}\n\n`);

  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, content) => `**${stripTags(content)}**`);
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, content) => `**${stripTags(content)}**`);
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, content) => `*${stripTags(content)}*`);
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, content) => `*${stripTags(content)}*`);

  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => `[${stripTags(content)}](${href})`);

  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => `![${alt}](${src})\n\n`);
  md = md.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, alt, src) => `![${alt}](${src})\n\n`);
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => `![](${src})\n\n`);

  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const lines = stripTags(content).trim().split('\n');
    return lines.map(line => `> ${line}`).join('\n') + '\n\n';
  });

  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, content) => `\`\`\`\n${decodeHtmlEntities(content)}\n\`\`\`\n\n`);
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, content) => `\`${decodeHtmlEntities(content)}\``);

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => `- ${stripTags(item).trim()}\n`);
    return stripTags(items) + '\n';
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let idx = 1;
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => `${idx++}. ${stripTags(item).trim()}\n`);
    return stripTags(items) + '\n';
  });

  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `${content.trim()}\n\n`);

  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, content) => `${content}\n`);

  md = md.replace(/<[^>]+>/g, '');

  md = decodeHtmlEntities(md);

  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
