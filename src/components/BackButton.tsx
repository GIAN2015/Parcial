// src/components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

interface Props {
  fallback?: string;
}

export default function BackButton({ fallback = "/dashboard" }: Props) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--fg)]"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="opacity-80"
      >
        <path
          fill="currentColor"
          d="M11.5 19L4 11.5L11.5 4l1.4 1.4L7.8 10.5H20v2H7.8l5.1 5.1z"
        />
      </svg>
      <span>Volver</span>
    </button>
  );
}
