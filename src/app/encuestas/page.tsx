"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { getAuth } from "@/lib/auth";
import { createSurvey, hasResponded, listSurveys, toggleSurveyActive } from "@/lib/db";
import type { AuthData, Survey } from "@/lib/types";
import Link from "next/link";

export default function EncuestasPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState<string>("");

  useEffect(() => {
    const a = getAuth(); setAuth(a);
    setSurveys(listSurveys());
  }, []);

  const isCoord = auth?.role === "coordinador";

  function create(e: React.FormEvent) {
    e.preventDefault();
    const preguntas = qs.split("\n").map(s=>s.trim()).filter(Boolean);
    if (!title || preguntas.length === 0) return;
    createSurvey({ titulo: title, preguntas, activa: true });
    setTitle(""); setQs("");
    setSurveys(listSurveys());
  }

  function toggle(s: Survey) {
    toggleSurveyActive(s.id, !s.activa);
    setSurveys(listSurveys());
  }

  return (
    <Protected>
      <main className="mx-auto max-w-5xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <div className="text-sm text-[var(--muted)]">Encuestas de empleabilidad</div>
        </div>

        {isCoord && (
          <section className="mb-6 rounded-2xl border border-[var(--line)] p-4">
            <div className="text-base font-semibold">Nueva encuesta</div>
            <form onSubmit={create} className="mt-3 grid gap-3">
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">Título</span>
                <input className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
                  value={title} onChange={e=>setTitle(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">Preguntas (una por línea)</span>
                <textarea className="min-h-[120px] rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
                  value={qs} onChange={e=>setQs(e.target.value)} />
              </label>
              <div className="flex justify-end">
                <button className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-white hover:brightness-105">Crear</button>
              </div>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {surveys.map(s=>{
            const already = auth?.username ? hasResponded(auth.username, s.id) : false;
            return (
              <div key={s.id} className="animate-fade rounded-2xl border border-[var(--line)] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">{s.titulo}</div>
                  <span className={["rounded-lg px-2 py-1 text-xs", s.activa ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30" : "bg-[var(--line)]/40 text-[var(--muted)] border border-[var(--line)]"].join(" ")}>
                    {s.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">{s.preguntas.length} preguntas</div>
                <div className="mt-3 flex gap-2">
                  {auth?.role === "egresado" && (
                    <Link
                      href={`/encuestas/${s.id}`}
                      className={["rounded-xl px-3 py-2 text-sm", (!s.activa || already) ? "cursor-not-allowed border border-[var(--line)] text-[var(--muted)]" : "bg-[var(--accent)] text-white"].join(" ")}
                      aria-disabled={!s.activa || already}
                    >
                      {already ? "Respondida ✓" : "Responder"}
                    </Link>
                  )}
                  {isCoord && (
                    <button onClick={()=>toggle(s)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm transition hover:border-[var(--accent)]">
                      {s.activa ? "Pausar" : "Activar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </Protected>
  );
}
