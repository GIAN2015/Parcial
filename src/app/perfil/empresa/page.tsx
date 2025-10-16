"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { getCompanyProfile, saveCompanyProfile } from "@/lib/db";
import type { CompanyProfile } from "@/lib/types";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function PerfilEmpresaPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<CompanyProfile>({
    username: "",
    nombreEmpresa: "",
    email: "",
    telefono: "",
    ruc: "",
    descripcion: "",
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      const p = getCompanyProfile(auth.username);
      if (p) setForm(p);
      else setForm((f) => ({ ...f, username: auth.username, email: `${auth.username}` }));
    }
  }, []);

  function update<K extends keyof CompanyProfile>(k: K, v: CompanyProfile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveCompanyProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Protected allowedRoles={["empresa"]}>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <BackButton />
          <span className="text-xs text-[var(--muted)]">Completa tu ficha para publicar ofertas.</span>
        </div>

        <section className="animate-fade rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <h1 className="text-2xl font-bold">Perfil de Empresa</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Proporciona datos institucionales claros para agilizar el proceso de revisión y publicación.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <Text id="nombreEmpresa" label="Nombre de la empresa" value={form.nombreEmpresa} onChange={(v) => update("nombreEmpresa", v)} />
            <Two>
              <Text id="email" label="Email" value={form.email} onChange={(v) => update("email", v)} />
              <Text id="telefono" label="Teléfono" value={form.telefono || ""} onChange={(v) => update("telefono", v)} />
            </Two>
            <Two>
              <Text id="ruc" label="RUC" value={form.ruc || ""} onChange={(v) => update("ruc", v)} />
              <Text id="descripcion" label="Descripción breve" value={form.descripcion || ""} onChange={(v) => update("descripcion", v)} />
            </Two>

            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-105" type="submit">Guardar</button>
              {saved && <span className="animate-fade text-sm text-emerald-400">Guardado ✓</span>}
              <Link href="/ofertas/nueva" className="ml-auto rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]">
                Publicar oferta
              </Link>
            </div>
          </form>
        </section>
      </main>
    </Protected>
  );
}

function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function Text(props: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-[var(--muted)]">{props.label}</label>
      <input id={props.id} value={props.value} onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]" />
    </div>
  );
}
