import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Icon } from "@/components/ui/Icon";
import { repository } from "@/lib/data";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await repository.getBlogPostById(id);
  if (!post) notFound();

  return (
    <AdminShell title="Blog Yönetimi">
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="mb-4 inline-flex items-center text-body-md text-on-surface-variant transition-colors hover:text-secondary"
        >
          <Icon name="arrow_back" className="mr-1 text-sm" />
          Blog Yazılarına Dön
        </Link>
        <h1 className="mb-2 text-display-lg font-display-lg text-on-surface">{post.title}</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          {post.categoryName} · {post.publishedAt ? formatDate(post.publishedAt) : "Yayın tarihi yok"} ·{" "}
          {post.readTime} dk okuma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {post.heroImage && (
            <div className="relative h-72 overflow-hidden rounded-xl border border-outline-variant/30">
              <Image src={post.heroImage} alt={post.title} fill unoptimized className="object-cover" />
            </div>
          )}

          <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
            <div
              className="prose prose-invert max-w-none text-on-surface [&_a]:text-secondary [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                Blog Yönetimi
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              Bu ekran şimdilik salt görüntüleme amaçlıdır — yazı ekleme/düzenleme/silme
              yakında bu panele eklenecek.
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
            <h3 className="mb-4 text-headline-sm font-headline-sm font-bold text-on-surface">
              Yazar
            </h3>
            <div className="flex items-center gap-3">
              {post.authorImage && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={post.authorImage}
                    alt={post.authorName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-body-md font-medium text-on-surface">{post.authorName || "—"}</p>
                <p className="text-xs text-on-surface-variant">{post.authorTitle}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-primary-container p-6">
            <h3 className="mb-3 text-headline-sm font-headline-sm font-bold text-on-surface">
              Durum
            </h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded border px-2 py-1 text-xs font-medium ${
                  post.isPublished
                    ? "border-secondary/20 bg-secondary/20 text-secondary"
                    : "border-outline-variant bg-surface-variant text-on-surface-variant"
                }`}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                {post.isPublished ? "Yayında" : "Taslak"}
              </span>
              {post.isFeatured && (
                <span className="inline-flex items-center rounded border border-secondary/20 bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
                  Öne Çıkan
                </span>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
