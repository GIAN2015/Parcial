"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { getAuth } from "@/lib/auth";
import { createNotice, listNotices } from "@/lib/db";
import type { AuthData, Notice } from "@/lib/types";

export default function ComunicadosPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  useEffect(() => {
    setAuth(getAuth());
    setNotices(listNotices());
  }, []);

  const isCoord = auth?.role === "coordinador";

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !cuerpo) return;
    createNotice({ titulo, cuerpo });
    setTitulo(""); setCuerpo("");
    setNotices(listNotices());
  }

  return (
    <Protected>
      <main className="mx-auto max-w-5xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <div className="text-sm text-[var(--muted)]">Comunicados</div>
        </div>

        {isCoord && (
          <section className="mb-6 rounded-2xl border border-[var(--line)] p-4">
            <div className="text-base font-semibold">Nuevo comunicado</div>
            <form onSubmit={create} className="mt-3 grid gap-3">
              <Input label="Título" value={titulo} onChange={setTitulo} />
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">Cuerpo</span>
                <textarea value={cuerpo} onChange={e=>setCuerpo(e.target.value)} className="min-h-[100px] rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5" />
              </label>
              <div className="flex justify-end">
                <button className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-white hover:brightness-105">Publicar</button>
              </div>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3">
          {notices.map(n=>(
            <article key={n.id} className="animate-fade rounded-2xl border border-[var(--line)] p-4">
              <div className="text-base font-semibold">{n.titulo}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{new Date(n.creadaEn).toLocaleString()}</div>
              <p className="mt-2 text-sm opacity-90">{n.cuerpo}</p>
            </article>
          ))}
        </section>
      </main>
    </Protected>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v:string)=>void }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <input className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5" value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  );
}
