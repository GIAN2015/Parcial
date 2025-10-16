"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { getAuth, logout } from "@/lib/auth";
import type { AuthData } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);

  useEffect(() => { setAuth(getAuth()); }, []);
  function handleLogout(){ logout(); router.replace("/"); }

  const isEmpresa = auth?.role === "empresa";

  return (
    <Protected>
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--card)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm text-[var(--muted)]">
            Feria de Empleabilidad UNTELS · Panel
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--accent)]"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-5">
        {/* Hero UNTELS */}
        <section className="animate-fade rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-sky-600/15 p-5">
          <h1 className="m-0 text-2xl font-extrabold">
            {isEmpresa ? "Panel de Empresa — UNTELS" : "Panel de Estudiante — UNTELS"}
          </h1>
          <p className="mt-1 text-sm opacity-85">
            Bienvenido{auth?.username ? `, ${auth.username}` : ""}. Estás autenticado como{" "}
            <b>{auth?.role}</b>. La Oficina de Empleabilidad te acompaña para conectar con
            oportunidades reales de prácticas y primer empleo.
          </p>
        </section>

        {/* Acciones rápidas */}
        <section
          className={[
            "mt-5 animate-fade rounded-2xl border p-5",
            isEmpresa ? "border-sky-500/30 bg-sky-500/10" : "border-emerald-500/30 bg-emerald-500/10",
          ].join(" ")}
        >
          <div className="mt-1 text-sm opacity-80">
            {isEmpresa
              ? "Administra tus vacantes y gestiona postulaciones con claridad."
              : "Explora ofertas activas y da seguimiento a tus postulaciones."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isEmpresa ? (
              <>
                <Link
                  href="/perfil/empresa"
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
                >
                  Completar perfil
                </Link>
                <Link
                  href="/ofertas/nueva"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  Publicar oferta
                </Link>
                <Link
                  href="/postulaciones"
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
                >
                  Postulaciones recibidas
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/perfil/estudiante"
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
                >
                  Completar perfil
                </Link>
                <Link
                  href="/ofertas"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  Ver ofertas
                </Link>
                <Link
                  href="/postulaciones"
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
                >
                  Mis postulaciones
                </Link>
              </>
            )}
          </div>
        </section>
      </main>
    </Protected>
  );
}
