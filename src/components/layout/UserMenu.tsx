"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { LogoutButton } from "./LogoutButton";
import type { AuthUser } from "@/lib/types";

export function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative ml-1 sm:ml-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-container"
      >
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-outline-variant/50">
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={32}
            height={32}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <span className="hidden text-body-md text-on-surface md:inline">{user.name}</span>
        <Icon
          name="expand_more"
          className={`hidden text-lg text-on-surface-variant transition-transform md:inline ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high shadow-lg"
        >
          <div className="border-b border-outline-variant/50 px-4 py-3">
            <p className="truncate text-body-md font-medium text-on-surface">{user.name}</p>
            <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
          </div>
          <div className="p-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
