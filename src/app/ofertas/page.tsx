"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { listOffers, applyToOffer, listApplicationsByStudent } from "@/lib/db";
import type { Offer, AuthData } from "@/lib/types";
import BackButton from "@/components/BackButton";

export default function OfertasPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const a = getAuth();
    setAuth(a);
    setOffers(listOffers());
    if (a) {
      const myApps = listApplicationsByStudent(a.username);
      setAppliedIds(new Set(myApps.map((app) => app.offerId)));
    }
  }, []);

  const total = useMemo(() => offers.length, [offers]);

  function onApply(o: Offer) {
    if (!auth) return;
    if (appliedIds.has(o.id)) return; // ya aplicado, ignora
    applyToOffer({ offer: o, estudianteUsername: auth.username }); // la “BD” ya evita duplicados
    setAppliedIds((prev) => new Set(prev).add(o.id)); // reflejo inmediato en UI
  }

  return (
    <Protected allowedRoles={["estudiante"]}>
      <main className="mx-auto max-w-5xl p-5">
        {/* Barra superior: Volver + info ligera */}
        <div className="mb-4 flex items-center justify-between">
          <BackButton fallback="/dashboard" />
          <span className="text-xs text-[var(--muted)]">Total de ofertas: {total}</span>
        </div>

        {/* Hero UNTELS */}
        <section
          className="animate-fade overflow-hidden rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-sky-600/15 p-5"
          aria-label="Feria UNTELS"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold shadow">
                U
              </div>
              <div>
                <h1 className="m-0 text-xl font-extrabold tracking-tight">
                  Feria de Empleabilidad Virtual — <span className="text-emerald-400">UNTELS</span>
                </h1>
                <p className="mt-0.5 text-sm text-emerald-100/80">
                  Conecta con oportunidades de prácticas y primeros empleos. Postula en un clic.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              Sesión: <b>{auth?.username}</b>
            </div>
          </div>
        </section>

        {/* Descripción breve */}
        <p className="mt-4 text-sm text-[var(--muted)]">
          Explora las vacantes disponibles y encuentra la que más se ajuste a tu perfil. No puedes postular
          varias veces a la misma oferta: si ya postulaste, verás <b>“Postulado ✓”</b>.
        </p>

        {/* Listado de ofertas */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {offers.length === 0 && (
            <div className="animate-fade rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              No hay ofertas aún. Intenta más tarde.
            </div>
          )}

          {offers.map((o) => {
            const already = appliedIds.has(o.id);
            return (
              <article
                key={o.id}
                className="group animate-fade rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]"
              >
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="m-0 text-base font-semibold">{o.titulo}</h2>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {o.modalidad} · {new Date(o.creadaEn).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    Oferta
                  </div>
                </header>

                <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/90">{o.descripcion}</p>

                <button
                  onClick={() => onApply(o)}
                  disabled={already}
                  aria-disabled={already}
                  className={[
                    "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 font-semibold transition",
                    already
                      ? "cursor-not-allowed border border-[var(--line)] text-[var(--muted)]"
                      : "bg-[var(--accent)] text-white hover:brightness-105",
                  ].join(" ")}
                >
                  {already ? "Postulado ✓" : "Postular"}
                  {!already && (
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8l8-8z"
                      />
                    </svg>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </main>
    </Protected>
  );
}
