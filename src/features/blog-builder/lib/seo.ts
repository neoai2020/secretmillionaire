export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

export function uniqueSlug(base: string, existing: string[]): string {
  let slug = slugify(base);
  let n = 2;
  while (existing.includes(slug)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  existing.push(slug);
  return slug;
}

export function buildArticleJsonLd(params: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    url: params.url,
    image: params.imageUrl ?? undefined,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: { "@type": "Organization", name: "Secret Millionaire Society" },
    publisher: {
      "@type": "Organization",
      name: "Secret Millionaire Society",
    },
  };
}

export function truncateMeta(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}
