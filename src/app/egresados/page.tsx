"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { listGraduateProfiles, upsertGraduateProfile } from "@/lib/db";
import { createUserAccount } from "@/lib/auth";
import type { GraduateProfile } from "@/lib/types";

export default function EgresadosPage() {
  const [list, setList] = useState<GraduateProfile[]>([]);
  const [q, setQ] = useState("");

  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    nombres: string;
    apellidos: string;
    carrera: string;
    anioEgreso: string;
  }>({
    username: "",
    password: "",
    nombres: "",
    apellidos: "",
    carrera: "",
    anioEgreso: "",
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setList(listGraduateProfiles());
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((p) =>
      [p.nombres, p.apellidos, p.carrera, p.empleoActual?.empresa, p.empleoActual?.cargo]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(s))
    );
  }, [list, q]);

  function handleCreate(e: any) {
    e.preventDefault();
    setFeedback("");

    if (!newUser.username || !newUser.password) {
      setFeedback("Usuario y contraseña son obligatorios.");
      return;
    }

    const res = createUserAccount(newUser.username, newUser.password, "egresado");
    if (!res.ok) {
      setFeedback(res.error || "No se pudo crear el usuario.");
      return;
    }

    upsertGraduateProfile({
      username: newUser.username.trim().toLowerCase(),
      nombres: newUser.nombres || undefined,
      apellidos: newUser.apellidos || undefined,
      carrera: newUser.carrera || undefined,
      anioEgreso: newUser.anioEgreso ? Number(newUser.anioEgreso) : undefined,
      empleoActual: null,
    });

    setList(listGraduateProfiles());
    setNewUser({
      username: "",
      password: "",
      nombres: "",
      apellidos: "",
      carrera: "",
      anioEgreso: "",
    });
    setFeedback("Cuenta de egresado creada correctamente ✔");
  }

  return (
    <Protected allowedRoles={["coordinador"]}>
      <main className="mx-auto max-w-6xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <div className="text-sm text-[var(--muted)]">
            Directorio de egresados
          </div>
        </div>

        {/* Registrar nuevo egresado (crea usuario + perfil básico) */}
        <section className="mb-6 rounded-2xl border border-[var(--line)] p-4">
          <div className="text-base font-semibold">Registrar nuevo egresado</div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Solo el coordinador puede crear usuarios de egresados. Esto genera la cuenta de acceso y un perfil base.
          </p>
          <form
            onSubmit={handleCreate}
            className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            <InputSmall
              label="Usuario"
              value={newUser.username}
              onChange={(v) => setNewUser((u) => ({ ...u, username: v }))}
            />
            <InputSmall
              label="Contraseña"
              type="password"
              value={newUser.password}
              onChange={(v) => setNewUser((u) => ({ ...u, password: v }))}
            />
            <InputSmall
              label="Nombres"
              value={newUser.nombres}
              onChange={(v) => setNewUser((u) => ({ ...u, nombres: v }))}
            />
            <InputSmall
              label="Apellidos"
              value={newUser.apellidos}
              onChange={(v) => setNewUser((u) => ({ ...u, apellidos: v }))}
            />
            <InputSmall
              label="Carrera"
              value={newUser.carrera}
              onChange={(v) => setNewUser((u) => ({ ...u, carrera: v }))}
            />
            <InputSmall
              label="Año egreso"
              type="number"
              value={newUser.anioEgreso}
              onChange={(v) => setNewUser((u) => ({ ...u, anioEgreso: v }))}
            />
            <div className="md:col-span-3 flex items-center justify-between gap-3">
              {feedback && (
                <span className="text-xs text-[var(--muted)]">{feedback}</span>
              )}
              <button className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:brightness-105">
                Crear cuenta
              </button>
            </div>
          </form>
        </section>

        {/* Buscador */}
        <div className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, carrera, empresa…"
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(14,165,163,0.18)]"
          />
        </div>

        {/* Lista de egresados */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <div
              key={p.username}
              className="animate-fade rounded-2xl border border-[var(--line)] p-4"
            >
              <div className="text-base font-semibold">
                {p.apellidos ?? ""}, {p.nombres ?? ""}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {p.carrera ?? "—"} · {p.anioEgreso ?? "—"}
              </div>
              {p.empleoActual && (
                <div className="mt-2 text-sm">
                  <b>{p.empleoActual.cargo}</b> en {p.empleoActual.empresa}
                  {p.empleoActual.ciudad ? ` · ${p.empleoActual.ciudad}` : ""}
                </div>
              )}
              <div className="mt-2 text-xs text-[var(--muted)]">
                {p.emailPersonal || p.emailInstitucional || "Sin correo"}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              Sin resultados.
            </div>
          )}
        </section>
      </main>
    </Protected>
  );
}

function InputSmall({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:rgba(14,165,163,0.45)]"
      />
    </label>
  );
}
