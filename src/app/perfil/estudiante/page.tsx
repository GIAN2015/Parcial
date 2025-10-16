"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { getStudentProfile, saveStudentProfile } from "@/lib/db";
import type { StudentProfile } from "@/lib/types";
import BackButton from "@/components/BackButton";

type StudentProfileDraft = Omit<StudentProfile, "habilidades" | "intereses"> & {
  habilidades?: string[] | string;
  intereses?: string[] | string;
};

export default function PerfilEstudiantePage() {
  const [authUser, setAuthUser] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<StudentProfileDraft>({
    username: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    educacion: "",
    habilidades: "",
    disponibilidad: "",
    intereses: "",
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setAuthUser(auth.username);
      const p = getStudentProfile(auth.username);
      if (p) setForm({ ...p, habilidades: toCSVDisplay(p.habilidades), intereses: toCSVDisplay(p.intereses) });
      else setForm((f) => ({ ...f, username: auth.username, email: `${auth.username}` }));
    }
  }, []);

  function update<K extends keyof StudentProfileDraft>(k: K, v: StudentProfileDraft[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: StudentProfile = {
      username: form.username,
      nombres: form.nombres,
      apellidos: form.apellidos,
      email: form.email,
      telefono: form.telefono,
      educacion: form.educacion,
      disponibilidad: form.disponibilidad,
      habilidades: splitCSV(form.habilidades),
      intereses: splitCSV(form.intereses),
    };
    saveStudentProfile(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Protected allowedRoles={["estudiante"]}>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <BackButton />
          <span className="text-xs text-[var(--muted)]">Completa todos los campos marcados.</span>
        </div>

        <section className="animate-fade rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <h1 className="text-2xl font-bold">Perfil de Estudiante</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tu perfil ayuda a las empresas a entender tu preparación, áreas de interés y disponibilidad.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <Two>
              <Text id="nombres" label="Nombres" value={form.nombres} onChange={(v) => update("nombres", v)} />
              <Text id="apellidos" label="Apellidos" value={form.apellidos} onChange={(v) => update("apellidos", v)} />
            </Two>

            <Two>
              <Text id="email" label="Email" value={form.email} onChange={(v) => update("email", v)} />
              <Text id="telefono" label="Teléfono" value={form.telefono || ""} onChange={(v) => update("telefono", v)} />
            </Two>

            <TextArea id="educacion" label="Educación (resumen)" value={form.educacion || ""} onChange={(v) => update("educacion", v)} />

            <Two>
              <Text id="disponibilidad" label="Disponibilidad (full-time/part-time)" value={form.disponibilidad || ""} onChange={(v) => update("disponibilidad", v)} />
              <Text id="habilidades" label="Habilidades (separadas por coma)" value={toCSVDisplay(form.habilidades)} onChange={(v) => update("habilidades", v)} />
            </Two>

            <Text id="intereses" label="Intereses (separados por coma)" value={toCSVDisplay(form.intereses)} onChange={(v) => update("intereses", v)} />

            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-105" type="submit">Guardar</button>
              {saved && <span className="animate-fade text-sm text-emerald-400">Guardado ✓</span>}
              <span className="ml-auto text-xs text-[var(--muted)]">Usuario: {authUser}</span>
            </div>
          </form>
        </section>
      </main>
    </Protected>
  );
}

/* Helpers CSV robustos */
function splitCSV(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map(sane);
  return String(v ?? "").split(",").map(sane).filter(Boolean);
}
function toCSVDisplay(v: unknown): string {
  if (Array.isArray(v)) return v.map(String).map(sane).join(", ");
  if (typeof v === "string") return v;
  return "";
}
function sane(s: string){ return s.trim(); }

/* UI bits */
function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function Text(props:{ id:string; label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-[var(--muted)]">{props.label}</label>
      <input id={props.id} value={props.value} onChange={(e)=>props.onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]" />
    </div>
  );
}
function TextArea(props:{ id:string; label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-[var(--muted)]">{props.label}</label>
      <textarea id={props.id} value={props.value} onChange={(e)=>props.onChange(e.target.value)} rows={4}
        className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]" />
    </div>
  );
}
