"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadBlogImageAction } from "@/lib/data/blog-actions";

export interface UploadedBlogImage {
  path: string;
  url: string;
}

interface BlogImageUploadFieldProps {
  label: string;
  imageType: "hero" | "author";
  currentUrl: string | null;
  required?: boolean;
  error?: string | null;
  onChange: (image: UploadedBlogImage | null) => void;
}

export function BlogImageUploadField({
  label,
  imageType,
  currentUrl,
  required,
  error: externalError,
  onChange,
}: BlogImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputId = `blog-image-${imageType}`;
  const error = uploadError ?? externalError;

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("imageType", imageType);
    const result = await uploadBlogImageAction(formData);
    setUploading(false);
    if (result.error || !result.path || !result.url) {
      setUploadError(result.error ?? "Yükleme başarısız.");
      return;
    }
    setPreviewUrl(result.url);
    onChange({ path: result.path, url: result.url });
  }

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div>
      <p className="mb-1.5 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </p>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-surface-deep ${
            error ? "border-error" : "border-outline-variant"
          }`}
        >
          {displayUrl ? (
            <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" className="text-2xl text-on-surface-variant/50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-lg border border-outline-variant px-4 py-2 text-center text-sm text-on-surface transition-colors hover:bg-surface-container"
          >
            {uploading ? "Yükleniyor..." : displayUrl ? "Değiştir" : "Görsel Seç"}
          </label>
          <p className="text-xs text-on-surface-variant">PNG, JPG (maks. 5MB)</p>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
