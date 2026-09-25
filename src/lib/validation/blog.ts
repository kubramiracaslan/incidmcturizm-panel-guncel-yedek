/**
 * Pure, isomorphic validation for the Blog Yönetimi form — no server-only
 * imports, safe to bundle into a client component. Both `BlogPostFormModal`
 * (client, UX-only feedback) and `blog-actions.ts` (server, authoritative)
 * call this same function so the rules can never drift apart between the
 * two — same pattern as `validation/home.ts`.
 */

export interface BlogPostFormInput {
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  readTime: string;
  publishedAt: string;
  authorName: string;
  authorTitle: string;
  content: string;
}

export interface BlogPostValue {
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  readTime: number;
  publishedAt: string;
  authorName: string;
  authorTitle: string;
  content: string;
}

export type BlogPostFieldErrors = Partial<Record<keyof Omit<BlogPostFormInput, "authorTitle">, string>>;

export type BlogPostValidationResult =
  | { valid: true; value: BlogPostValue; fieldErrors: BlogPostFieldErrors }
  | { valid: false; fieldErrors: BlogPostFieldErrors };

export function validateBlogPostInput(input: BlogPostFormInput): BlogPostValidationResult {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const excerpt = input.excerpt.trim();
  const categoryName = input.categoryName.trim();
  const publishedAt = input.publishedAt.trim();
  const authorName = input.authorName.trim();
  const authorTitle = input.authorTitle.trim();
  const content = input.content.trim();
  const readTime = Number(input.readTime);

  const fieldErrors: BlogPostFieldErrors = {};
  if (!title) fieldErrors.title = "Başlık boş bırakılamaz.";
  if (!slug) fieldErrors.slug = "Slug boş bırakılamaz.";
  if (!excerpt) fieldErrors.excerpt = "Özet boş bırakılamaz.";
  if (!categoryName) fieldErrors.categoryName = "Kategori boş bırakılamaz.";
  if (!input.readTime.trim() || Number.isNaN(readTime) || readTime <= 0) {
    fieldErrors.readTime = "Geçerli bir okuma süresi girin.";
  }
  if (!publishedAt) fieldErrors.publishedAt = "Yayın tarihi boş bırakılamaz.";
  if (!authorName) fieldErrors.authorName = "Yazar adı boş bırakılamaz.";
  if (!content) fieldErrors.content = "İçerik boş bırakılamaz.";

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return {
    valid: true,
    value: { title, slug, excerpt, categoryName, readTime, publishedAt, authorName, authorTitle, content },
    fieldErrors: {},
  };
}
