import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { repository } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { BlogPostCreateButton, BlogPostEditButton } from "@/components/blog/BlogPostFormModal";
import { BlogPostDeleteButton } from "@/components/blog/BlogPostDeleteButton";
import { BlogPostStatusToggleButton } from "@/components/blog/BlogPostStatusToggleButton";

export default async function AdminBlogPage() {
  const posts = await repository.listBlogPosts();

  return (
    <AdminShell title="Blog Yönetimi">
      <PageHeader
        title="Blog Yönetimi"
        description={`Sitedeki ${posts.length} blog yazısını görüntüleyin`}
        actions={<BlogPostCreateButton />}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-primary-container shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left">
            <thead>
              <tr className="border-b border-white/10 bg-surface-deep/50">
                <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Başlık
                </th>
                <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Kategori
                </th>
                <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Yazar
                </th>
                <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Yayın Tarihi
                </th>
                <th className="px-4 py-3 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Durum
                </th>
                <th className="px-4 py-3 text-right text-label-sm font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-table-data font-table-data">
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                    Henüz blog yazısı bulunamadı.
                  </td>
                </tr>
              )}
              {posts.map((post, index) => (
                <tr
                  key={post.id}
                  className={`group transition-all hover:border-l hover:border-mint-glow hover:bg-surface-variant/30 ${
                    index % 2 === 1 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="max-w-xs truncate px-4 py-3">
                    <span className="font-medium text-on-surface transition-colors group-hover:text-primary">
                      {post.title}
                    </span>
                    {post.isFeatured && (
                      <span className="ml-2 rounded border border-secondary/20 bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
                        Öne Çıkan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{post.categoryName || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{post.authorName || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <BlogPostStatusToggleButton id={post.id} isPublished={post.isPublished} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="inline-flex items-center gap-1 rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        title="Görüntüle"
                      >
                        <Icon name="visibility" className="text-[20px]" />
                      </Link>
                      <BlogPostEditButton post={post} />
                      <BlogPostDeleteButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
