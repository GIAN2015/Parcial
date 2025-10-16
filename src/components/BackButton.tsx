"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallback = "/dashboard",
  label = "Volver",
  className = "",
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={goBack}
      className={[
        "group inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm transition",
        "hover:border-[var(--accent)] hover:bg-[var(--card)]/60",
        className,
      ].join(" ")}
      aria-label={label}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
        className="transition group-hover:-translate-x-0.5"
      >
        <path fill="currentColor" d="M15 18l-6-6l6-6l1.4 1.4L11.8 12l4.6 4.6z" />
      </svg>
      {label}
    </button>
  );
}
