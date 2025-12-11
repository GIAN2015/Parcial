"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { getAuth } from "@/lib/auth";
import { getGraduateProfile, upsertGraduateProfile } from "@/lib/db";
import type { GraduateProfile, JobRecord } from "@/lib/types";

export default function PerfilEgresadoPage() {
  const [p, setP] = useState<GraduateProfile | null>(null);

  useEffect(() => {
    const a = getAuth();
    if (!a) return;
    const existing = getGraduateProfile(a.username) ?? {
      username: a.username,
      empleoActual: null,
    };
    setP(existing);
  }, []);

  const completeness = useMemo(() => {
    if (!p) return 0;
    const fields = [
      p.nombres, p.apellidos, p.emailInstitucional, p.emailPersonal,
      p.carrera, p.anioEgreso, p.telefono
    ];
    const filled = fields.filter((x)=>x!==undefined && x!==null && `${x}`.trim()!=="").length;
    return Math.round((filled / fields.length) * 100);
  }, [p]);

  function parseCSV(v: string): string[] {
    return (v || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    upsertGraduateProfile(p);
    alert("Perfil actualizado ✔");
  }

  return (
    <Protected allowedRoles={["egresado"]}>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-4">
          <BackButton />
        </div>

        <header className="mb-4">
          <h1 className="m-0 text-2xl font-extrabold">Mi perfil</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Completa tu información para mejorar el seguimiento y acceso a oportunidades.
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]/50">
            <div className="h-2 bg-[var(--accent)]" style={{ width: `${completeness}%` }} />
          </div>
          <div className="mt-1 text-xs text-[var(--muted)]">Completitud: {completeness}%</div>
        </header>

        {!p ? (
          <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">Cargando…</div>
        ) : (
          <form onSubmit={onSave} className="grid gap-5">
            {/* Datos personales */}
            <section className="rounded-2xl border border-[var(--line)] p-4">
              <div className="text-base font-semibold">Datos personales</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Nombres" value={p.nombres ?? ""} onChange={v=>setP({...p, nombres:v})} />
                <Input label="Apellidos" value={p.apellidos ?? ""} onChange={v=>setP({...p, apellidos:v})} />
                <Input label="DNI" value={p.dni ?? ""} onChange={v=>setP({...p, dni:v})} />
                <Input label="Teléfono" value={p.telefono ?? ""} onChange={v=>setP({...p, telefono:v})} />
                <Input label="Email institucional" value={p.emailInstitucional ?? ""} onChange={v=>setP({...p, emailInstitucional:v})} />
                <Input label="Email personal" value={p.emailPersonal ?? ""} onChange={v=>setP({...p, emailPersonal:v})} />
                <Input label="Carrera" value={p.carrera ?? ""} onChange={v=>setP({...p, carrera:v})} />
                <NumberInput label="Año de egreso" value={p.anioEgreso ?? 0} onChange={v=>setP({...p, anioEgreso:v})} />
                <Input label="Dirección" value={p.direccion ?? ""} onChange={v=>setP({...p, direccion:v})} />
                <Input label="LinkedIn" value={p.linkedin ?? ""} onChange={v=>setP({...p, linkedin:v})} />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Input label="Skills (separa con comas)" value={(p.skills ?? []).join(", ")} onChange={v=>setP({...p, skills: parseCSV(v)})} />
                <Input label="Intereses (separa con comas)" value={(p.intereses ?? []).join(", ")} onChange={v=>setP({...p, intereses: parseCSV(v)})} />
              </div>
            </section>

            {/* Empleo actual */}
            <section className="rounded-2xl border border-[var(--line)] p-4">
              <div className="text-base font-semibold">Empleo actual</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Empresa" value={p.empleoActual?.empresa ?? ""} onChange={v=>setJob(p, setP, { empresa:v })} />
                <Input label="Cargo" value={p.empleoActual?.cargo ?? ""} onChange={v=>setJob(p, setP, { cargo:v })} />
                <Input label="Ciudad" value={p.empleoActual?.ciudad ?? ""} onChange={v=>setJob(p, setP, { ciudad:v })} />
                <Input label="País" value={p.empleoActual?.pais ?? ""} onChange={v=>setJob(p, setP, { pais:v })} />
                <Select
                  label="Modalidad"
                  value={p.empleoActual?.modalidad ?? ""}
                  onChange={v=>setJob(p, setP, { modalidad: (v as JobRecord["modalidad"]) })}
                  options={[
                    { value: "", label: "—" },
                    { value: "practicas", label: "Prácticas" },
                    { value: "junior", label: "Junior" },
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                  ]}
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-semibold text-white hover:brightness-105">
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </main>
    </Protected>
  );
}

function setJob(
  p: GraduateProfile,
  setP: (p: GraduateProfile) => void,
  patch: Partial<JobRecord>
) {
  const next: GraduateProfile = { ...p, empleoActual: { ...(p.empleoActual ?? { empresa:"", cargo:"" }), ...patch } };
  setP(next);
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <input
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(14,165,163,0.18)]"
        value={value} onChange={e=>onChange(e.target.value)}
      />
    </label>
  );
}
function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v:number)=>void }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <input
        type="number" min={1900} max={2100}
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(14,165,163,0.18)]"
        value={value || 0} onChange={e=>onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v:string)=>void; options: {value:string; label:string}[];
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <select
        value={value} onChange={e=>onChange(e.target.value)}
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(14,165,163,0.18)]"
      >
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
