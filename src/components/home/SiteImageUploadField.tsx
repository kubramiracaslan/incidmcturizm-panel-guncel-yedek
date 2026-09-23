"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadSiteImageAction } from "@/lib/data/home-actions";

export interface UploadedImage {
  path: string;
  url: string;
}

interface SiteImageUploadFieldProps {
  label: string;
  imageType: "logo" | "hero" | "partner";
  currentUrl: string | null;
  maxSizeMB: number;
  onChange: (image: UploadedImage | null) => void;
}

export function SiteImageUploadField({
  label,
  imageType,
  currentUrl,
  maxSizeMB,
  onChange,
}: SiteImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputId = `site-image-${imageType}`;

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Yalnızca görsel dosyaları yüklenebilir.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Dosya boyutu en fazla ${maxSizeMB}MB olabilir.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("imageType", imageType);
    const result = await uploadSiteImageAction(formData);
    setUploading(false);
    if (result.error || !result.path || !result.url) {
      setError(result.error ?? "Yükleme başarısız.");
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
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-deep">
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
            {uploading ? "Yükleniyor..." : previewUrl ? "Değiştir" : "Görsel Seç"}
          </label>
          <p className="text-xs text-on-surface-variant">PNG, JPG (maks. {maxSizeMB}MB)</p>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
