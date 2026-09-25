"use client";

import { useState, useTransition } from "react";
import { updateBlogPostStatusAction } from "@/lib/data/blog-actions";

interface BlogPostStatusToggleButtonProps {
  id: string;
  isPublished: boolean;
}

export function BlogPostStatusToggleButton({ id, isPublished }: BlogPostStatusToggleButtonProps) {
  const [published, setPublished] = useState(isPublished);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !published;
    setPublished(next);
    startTransition(async () => {
      const result = await updateBlogPostStatusAction(id, next);
      if (result.error) {
        setPublished(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={published}
      title={published ? "Taslağa almak için tıklayın" : "Yayınlamak için tıklayın"}
      className="inline-flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          published ? "bg-secondary" : "bg-outline-variant"
        }`}
      >
        <span
          className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            published ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${published ? "text-secondary" : "text-on-surface-variant"}`}>
        {published ? "Yayında" : "Taslak"}
      </span>
    </button>
  );
}
