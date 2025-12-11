// src/components/Protected.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import type { Role, AuthData } from "@/lib/types";

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function Protected({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (!a) {
      router.replace("/");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(a.role)) {
      router.replace("/dashboard");
      return;
    }
    setAuth(a);
    setReady(true);
  }, [router, allowedRoles]);

  if (!ready) return null;
  return <>{children}</>;
}
