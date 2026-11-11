"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { createBlogPostAction, updateBlogPostAction } from "@/lib/data/blog-actions";
import { validateBlogPostInput, type BlogPostFieldErrors, type BlogPostFormInput } from "@/lib/validation/blog";
import { generateSlug } from "@/lib/validation/tour";
import { BlogImageUploadField, type UploadedBlogImage } from "./BlogImageUploadField";
import type { BlogPost } from "@/lib/types";

type BlogPostFormProps =
  | { mode: "create"; renderTrigger: (open: () => void) => ReactNode }
  | { mode: "edit"; post: BlogPost; renderTrigger: (open: () => void) => ReactNode };

interface Values extends BlogPostFormInput {
  slugTouched: boolean;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toFormValues(post?: BlogPost): Values {
  if (!post) {
    return {
      title: "",
      slug: "",
      slugTouched: false,
      excerpt: "",
      categoryName: "",
      readTime: "",
      publishedAt: todayIsoDate(),
      authorName: "",
      authorTitle: "",
      content: "",
      tags: [],
      isFeatured: false,
      isPublished: true,
    };
  }
  return {
    title: post.title,
    slug: post.slug,
    slugTouched: true,
    excerpt: post.excerpt,
    categoryName: post.categoryName,
    readTime: String(post.readTime),
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : todayIsoDate(),
    authorName: post.authorName,
    authorTitle: post.authorTitle,
    content: post.contentHtml,
    tags: post.tags,
    isFeatured: post.isFeatured,
    isPublished: post.isPublished,
  };
}

interface FieldProps {
  label: string;
  value: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  onChange: (value: string) => void;
}

function Field({ label, value, error, type = "text", multiline, rows = 3, hint, onChange }: FieldProps) {
  const className = `w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
    error
      ? "border-error focus:border-error focus:ring-error/50"
      : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
  }`;

  return (
    <div>
      <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={className} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        Etiketler
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`${tag} etiketini kaldır`}
              className="text-on-surface-variant/70 hover:text-error"
            >
              <Icon name="close" className="text-xs" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Etiket yazıp Enter'a basın"
        className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
      />
    </div>
  );
}

function BlogPostForm(props: BlogPostFormProps) {
  const post = props.mode === "edit" ? props.post : undefined;
  const [open, setOpen] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [values, setValues] = useState<Values>(() => toFormValues(post));
  const [heroImage, setHeroImage] = useState<UploadedBlogImage | null>(null);
  const [authorImage, setAuthorImage] = useState<UploadedBlogImage | null>(null);
  const [heroImageError, setHeroImageError] = useState<string | null>(null);
  const [authorImageError, setAuthorImageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BlogPostFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialValues = toFormValues(post);
  const isDirty =
    (Object.keys(initialValues) as (keyof Values)[]).some(
      (key) => JSON.stringify(values[key]) !== JSON.stringify(initialValues[key]),
    ) ||
    heroImage !== null ||
    authorImage !== null;

  function openModal() {
    setValues(initialValues);
    setHeroImage(null);
    setAuthorImage(null);
    setHeroImageError(null);
    setAuthorImageError(null);
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setOpen(true);
  }

  function requestClose() {
    if (isDirty) setConfirmingClose(true);
    else setOpen(false);
  }

  function discardAndClose() {
    setConfirmingClose(false);
    setOpen(false);
  }

  function setTitle(title: string) {
    const slug = values.slugTouched ? values.slug : generateSlug(title);
    setValues((prev) => ({ ...prev, title, slug }));
  }

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submitForm() {
    const validation = validateBlogPostInput(values);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      return;
    }
    const heroImagePath = heroImage?.path || post?.heroImagePath || "";
    const authorImagePath = authorImage?.path || post?.authorImagePath || "";
    let blocked = false;
    if (!heroImagePath) {
      setHeroImageError("Hero görseli zorunludur.");
      blocked = true;
    } else {
      setHeroImageError(null);
    }
    if (!authorImagePath) {
      setAuthorImageError("Yazar görseli zorunludur.");
      blocked = true;
    } else {
      setAuthorImageError(null);
    }
    if (blocked) return;

    setFieldErrors({});
    setFormError(null);

    const formData = new FormData();
    formData.set("title", validation.value.title);
    formData.set("slug", validation.value.slug);
    formData.set("excerpt", validation.value.excerpt);
    formData.set("categoryName", validation.value.categoryName);
    formData.set("readTime", String(validation.value.readTime));
    formData.set("publishedAt", validation.value.publishedAt);
    formData.set("authorName", validation.value.authorName);
    formData.set("authorTitle", validation.value.authorTitle);
    formData.set("content", validation.value.content);
    formData.set("heroImagePath", heroImagePath);
    formData.set("authorImagePath", authorImagePath);
    formData.set("isFeatured", String(values.isFeatured));
    formData.set("isPublished", String(values.isPublished));
    values.tags.forEach((tag) => formData.append("tags", tag));

    startTransition(async () => {
      const result =
        props.mode === "edit" ? await updateBlogPostAction(props.post.id, formData) : await createBlogPostAction(formData);
      if (result.error) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setConfirmingClose(false);
      setOpen(false);
      setSuccessMessage(props.mode === "edit" ? "Blog yazısı güncellendi." : "Blog yazısı başarıyla eklendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm();
  }

  return (
    <>
      {props.renderTrigger(openModal)}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-6">
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {props.mode === "edit" ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
              </h2>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Kapat"
                className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Başlık" value={values.title} error={fieldErrors.title} onChange={setTitle} />
                  <Field
                    label="Slug"
                    value={values.slug}
                    error={fieldErrors.slug}
                    hint="benzersiz olmalı"
                    onChange={(v) => setValues((prev) => ({ ...prev, slug: v, slugTouched: true }))}
                  />
                </div>

                <Field
                  label="Özet"
                  value={values.excerpt}
                  error={fieldErrors.excerpt}
                  multiline
                  rows={2}
                  onChange={(v) => set("excerpt", v)}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field
                    label="Kategori"
                    value={values.categoryName}
                    error={fieldErrors.categoryName}
                    onChange={(v) => set("categoryName", v)}
                  />
                  <Field
                    label="Okuma Süresi (dk)"
                    type="number"
                    value={values.readTime}
                    error={fieldErrors.readTime}
                    onChange={(v) => set("readTime", v)}
                  />
                  <Field
                    label="Yayın Tarihi"
                    type="date"
                    value={values.publishedAt}
                    error={fieldErrors.publishedAt}
                    onChange={(v) => set("publishedAt", v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Yazar Adı"
                    value={values.authorName}
                    error={fieldErrors.authorName}
                    onChange={(v) => set("authorName", v)}
                  />
                  <Field
                    label="Yazar Unvanı"
                    value={values.authorTitle}
                    hint="opsiyonel"
                    onChange={(v) => set("authorTitle", v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <BlogImageUploadField
                    label="Hero Görsel"
                    imageType="hero"
                    currentUrl={post?.heroImage ?? null}
                    required
                    error={heroImageError}
                    onChange={setHeroImage}
                  />
                  <BlogImageUploadField
                    label="Yazar Görseli"
                    imageType="author"
                    currentUrl={post?.authorImage ?? null}
                    required
                    error={authorImageError}
                    onChange={setAuthorImage}
                  />
                </div>

                <TagsField tags={values.tags} onChange={(tags) => set("tags", tags)} />

                <Field
                  label="İçerik (HTML)"
                  value={values.content}
                  error={fieldErrors.content}
                  multiline
                  rows={10}
                  hint="HTML kodu kabul edilir."
                  onChange={(v) => set("content", v)}
                />

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={values.isPublished}
                      onChange={(e) => set("isPublished", e.target.checked)}
                      className="h-4 w-4 rounded border-outline-variant"
                    />
                    Yayınla
                  </label>
                  <label className="flex items-center gap-2 text-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={values.isFeatured}
                      onChange={(e) => set("isFeatured", e.target.checked)}
                      className="h-4 w-4 rounded border-outline-variant"
                    />
                    Öne Çıkan
                  </label>
                </div>

                {formError && (
                  <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-outline-variant/50 p-6">
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmingClose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <h3 className="mb-2 text-headline-sm font-headline-sm font-bold text-on-surface">
              Kaydedilmemiş değişiklikler var
            </h3>
            <p className="mb-6 text-sm text-on-surface-variant">Çıkmak istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={discardAndClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submitForm}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary shadow-lg">
          {successMessage}
        </div>
      )}
    </>
  );
}

export function BlogPostCreateButton() {
  return (
    <BlogPostForm
      mode="create"
      renderTrigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-body-md font-body-md font-semibold text-primary-container transition-colors hover:bg-brand-dark"
        >
          <Icon name="add" className="text-lg" />
          Yeni Blog Yazısı
        </button>
      )}
    />
  );
}

interface BlogPostEditButtonProps {
  post: BlogPost;
  variant?: "icon" | "button";
}

export function BlogPostEditButton({ post, variant = "icon" }: BlogPostEditButtonProps) {
  return (
    <BlogPostForm
      mode="edit"
      post={post}
      renderTrigger={(open) =>
        variant === "button" ? (
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container"
          >
            <Icon name="edit" className="text-[18px]" />
            Düzenle
          </button>
        ) : (
          <button
            type="button"
            onClick={open}
            aria-label="Düzenle"
            className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            <Icon name="edit" className="text-[20px]" />
          </button>
        )
      }
    />
  );
}
