"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadTourImageAction } from "@/lib/data/tour-actions";

export interface ImageSlotState {
  path: string;
  url: string;
}

const emptySlot: ImageSlotState = { path: "", url: "" };

export interface ImagesFormState {
  hero: ImageSlotState;
  map: ImageSlotState;
  image1: ImageSlotState;
  image2: ImageSlotState;
  image3: ImageSlotState;
}

export const emptyImagesForm: ImagesFormState = {
  hero: emptySlot,
  map: emptySlot,
  image1: emptySlot,
  image2: emptySlot,
  image3: emptySlot,
};

interface ImageSlotFieldProps {
  label: string;
  slot: ImageSlotState;
  imageType: "hero" | "gallery" | "map";
  required?: boolean;
  error?: string | null;
  onChange: (slot: ImageSlotState) => void;
}

function ImageSlotField({ label, slot, imageType, required, error: externalError, onChange }: ImageSlotFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputId = `tour-image-${imageType}-${label.replace(/\s+/g, "-")}`;
  const error = uploadError ?? externalError;

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("imageType", imageType);
    const result = await uploadTourImageAction(formData);
    setUploading(false);
    if (result.error || !result.path || !result.url) {
      setUploadError(result.error ?? "Yükleme başarısız.");
      return;
    }
    onChange({ path: result.path, url: result.url });
  }

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
          {slot.url ? (
            <img src={slot.url} alt={label} className="h-full w-full object-cover" />
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
            {uploading ? "Yükleniyor..." : slot.path ? "Değiştir" : "Görsel Seç"}
          </label>
          {slot.path && (
            <button
              type="button"
              onClick={() => onChange(emptySlot)}
              className="text-xs text-error hover:underline"
            >
              Kaldır
            </button>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

interface ImagesTabProps {
  value: ImagesFormState;
  heroError?: string | null;
  onChange: (value: ImagesFormState) => void;
}

export function ImagesTab({ value, heroError, onChange }: ImagesTabProps) {
  return (
    <div className="space-y-8">
      <ImageSlotField
        label="Hero Görsel"
        slot={value.hero}
        imageType="hero"
        required
        error={heroError}
        onChange={(slot) => onChange({ ...value, hero: slot })}
      />
      <ImageSlotField
        label="Harita Görseli"
        slot={value.map}
        imageType="map"
        onChange={(slot) => onChange({ ...value, map: slot })}
      />
      <div>
        <p className="mb-4 text-headline-sm font-headline-sm font-bold text-on-surface">
          Galeri Görselleri
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ImageSlotField
            label="Galeri 1"
            slot={value.image1}
            imageType="gallery"
            onChange={(slot) => onChange({ ...value, image1: slot })}
          />
          <ImageSlotField
            label="Galeri 2"
            slot={value.image2}
            imageType="gallery"
            onChange={(slot) => onChange({ ...value, image2: slot })}
          />
          <ImageSlotField
            label="Galeri 3"
            slot={value.image3}
            imageType="gallery"
            onChange={(slot) => onChange({ ...value, image3: slot })}
          />
        </div>
      </div>
    </div>
  );
}
