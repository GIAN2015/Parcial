"use client";

import { useState } from "react";
import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { createOffer } from "@/lib/db";
import type { Offer } from "@/lib/types";
import BackButton from "@/components/BackButton";

export default function NuevaOfertaPage() {
  const auth = getAuth();
  const [ok, setOk] = useState(false);
  const [form, setForm] = useState<Omit<Offer, "id" | "creadaEn">>({
    titulo: "",
    descripcion: "",
    modalidad: "practicas",
    empresaUsername: auth?.username || "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    createOffer({ ...form, empresaUsername: auth.username });
    setOk(true);
    setForm({ titulo: "", descripcion: "", modalidad: "practicas", empresaUsername: auth.username });
    setTimeout(() => setOk(false), 1500);
  }

  return (
    <Protected allowedRoles={["empresa"]}>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <BackButton fallback="/dashboard" />
          <span className="text-xs text-[var(--muted)]">Describe claramente el rol y requisitos.</span>
        </div>

        <section className="animate-fade rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <h1 className="text-2xl font-bold">Publicar oferta — UNTELS</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Comparte una oportunidad con detalles útiles para atraer a los mejores postulantes.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <Text id="titulo" label="Título" value={form.titulo} onChange={(v) => update("titulo", v)} />
            <TextArea
              id="descripcion"
              label="Descripción"
              value={form.descripcion}
              onChange={(v) => update("descripcion", v)}
            />
            <div>
              <label className="mb-1 block text-xs text-[var(--muted)]">Modalidad</label>
              <select
                value={form.modalidad}
                onChange={(e) => update("modalidad", e.target.value as Offer["modalidad"])}
                className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]"
              >
                <option className="bg-[var(--card)]" value="practicas">
                  Prácticas
                </option>
                <option className="bg-[var(--card)]" value="junior">
                  Junior
                </option>
                <option className="bg-[var(--card)]" value="part-time">
                  Part-time
                </option>
                <option className="bg-[var(--card)]" value="full-time">
                  Full-time
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-105"
                type="submit"
              >
                Publicar
              </button>
              {ok && <span className="animate-fade text-sm text-emerald-400">Publicada ✓</span>}
            </div>
          </form>
        </section>
      </main>
    </Protected>
  );
}

function Text(props: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-[var(--muted)]">
        {props.label}
      </label>
      <input
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]"
      />
    </div>
  );
}
function TextArea(props: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-[var(--muted)]">
        {props.label}
      </label>
      <textarea
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]"
      />
    </div>
  );
}
