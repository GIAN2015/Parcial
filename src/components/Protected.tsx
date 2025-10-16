"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

type Props = { children: React.ReactNode; allowedRoles?: Role[] };

export default function Protected({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.replace("/"); return; }
    if (allowedRoles && !allowedRoles.includes(auth.role)) { router.replace("/dashboard"); return; }
    setReady(true);
  }, [router, allowedRoles]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="animate-fade flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
          Verificando sesión…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
