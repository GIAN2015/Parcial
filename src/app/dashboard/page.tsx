"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getAuth, logout } from "@/lib/auth";
import type { AuthData } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  useEffect(() => { setAuth(getAuth()); }, []);

  function handleLogout() { logout(); location.replace("/"); }

  const isCoord = auth?.role === "coordinador";

  return (
    <Protected>
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--card)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm text-[var(--muted)]">UNTELS · Seguimiento de Egresados</div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--accent)]"
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-5">
        <section className={["animate-fade rounded-2xl border p-5", isCoord ? "border-sky-500/30 bg-sky-500/10" : "border-emerald-500/30 bg-emerald-500/10"].join(" ")}>
          <h1 className="m-0 text-2xl font-extrabold">
            {isCoord ? "Panel de Coordinación" : "Panel del Egresado"}
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Bienvenido{auth?.username ? `, ${auth.username}` : ""}. Estás autenticado como <b>{auth?.role}</b>.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {isCoord ? (
              <>
                <Link href="/egresados" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Directorio de egresados</Link>
                <Link href="/encuestas" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">Encuestas</Link>
                <Link href="/eventos" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Eventos</Link>
                <Link href="/comunicados" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Comunicados</Link>
              </>
            ) : (
              <>
                <Link href="/perfil/estudiante" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Mi perfil</Link>
                <Link href="/encuestas" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">Encuestas</Link>
                <Link href="/eventos" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Eventos</Link>
                <Link href="/comunicados" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">Comunicados</Link>
              </>
            )}
          </div>
        </section>
      </main>
    </Protected>
  );
}
