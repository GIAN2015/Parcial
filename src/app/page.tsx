"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { login, getAuth, peekRole } from "@/lib/auth";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) router.replace("/dashboard");
  }, [router]);

  const detectedRole = useMemo(() => peekRole(username), [username]) as Role | null;

  const ctaLabel = useMemo(() => {
    if (detectedRole === "empresa") return "Ingresar como Empresa";
    if (detectedRole === "estudiante") return "Ingresar como Estudiante";
    return "Ingresar";
  }, [detectedRole]);

  const roleStyles = useMemo(() => {
    if (detectedRole === "empresa") {
      return {
        pill: "border-sky-500/40 bg-sky-500/10 text-sky-200",
        cta: "bg-gradient-to-br from-sky-600 to-indigo-600 text-white",
        focus: "focus:ring-[color:rgba(2,132,199,0.18)] focus:border-sky-500",
      };
    }
    if (detectedRole === "estudiante") {
      return {
        pill: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
        cta: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white",
        focus: "focus:ring-[color:rgba(16,185,129,0.18)] focus:border-emerald-500",
      };
    }
    return {
      pill: "border-[var(--line)] text-[var(--muted)]",
      cta: "bg-[var(--accent)] text-white",
      focus: "focus:ring-[color:rgba(99,102,241,0.15)] focus:border-[var(--accent)]",
    };
  }, [detectedRole]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");

    const res = login({ username, password });
    if (res.ok) router.push("/dashboard");
    else {
      setErr(res.error || "Error");
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md">
        {/* Hero UNTELS */}
        <div className="animate-fade mb-4 rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-sky-600/15 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold shadow">
              U
            </div>
            <div>
              <h1 className="m-0 text-xl font-extrabold tracking-tight">
                Feria de Empleabilidad Virtual — <span className="text-emerald-400">UNTELS</span>
              </h1>
              <p className="mt-0.5 text-sm text-emerald-100/80">
                Conecta a estudiantes con empresas. Dos ediciones al año: prácticas y primeros empleos.
              </p>
            </div>
          </div>
        </div>

        {/* Card de login */}
        <section
          className="animate-pop w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-xl"
          aria-labelledby="login-title"
        >
          <div className="mb-5">
            <h2 id="login-title" className="m-0 text-lg font-bold">
              Accede a tu panel
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Usaremos tu rol detectado para dirigir tu experiencia (estudiante o empresa).
            </p>
          </div>

          {/* Indicador de rol */}
          <div className="mb-4">
            {username ? (
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs",
                  roleStyles.pill,
                ].join(" ")}
                aria-live="polite"
              >
                {detectedRole === "empresa" ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M4 22V4q0-.825.588-1.413T6 2h8q.825 0 1.413.588T16 4v8h2q.825 0 1.413.588T20 14v8h-5v-4H9v4zM8 12h4V8H8zm0-6v2h4V6z" />
                    </svg>
                    <span>Entrarás como <b>Empresa</b></span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M12 12q-2.05 0-3.525-1.475T7 7q0-2.05 1.475-3.525T12 2t3.525 1.475T17 7q0 2.05-1.475 3.525T12 12m-9 9v-2.5q0-1.05.525-1.925T5 15.4q2.025-1.4 4.388-2.2T14 12.4q.975 0 1.925.125T17.8 13q-.825.725-1.312 1.725T16 16.5V21z" />
                    </svg>
                    <span>Entrarás como <b>Estudiante</b></span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-xs text-[var(--muted)]">
                Escribe tu email/usuario y te indicaremos el perfil detectado.
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="grid gap-4">
            <div>
              <label htmlFor="user" className="mb-1 block text-xs text-[var(--muted)]">
                Email o usuario
              </label>
              <div className="relative">
                <input
                  id="user"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="ep@uni.pe · EP · emp-admin · hr@company.pe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={[
                    "w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 pr-10 outline-none transition focus:ring-4",
                    roleStyles.focus,
                  ].join(" ")}
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                  aria-hidden="true"
                >
                  <path fill="currentColor" d="M12 12q-2.05 0-3.525-1.475T7 7q0-2.05 1.475-3.525T12 2t3.525 1.475T17 7q0 2.05-1.475 3.525T12 12m-9 9v-2.5q0-1.05.525-1.925T5 15.4q2.025-1.4 4.388-2.2T14 12.4q.975 0 1.925.125T17.8 13q-.825.725-1.312 1.725T16 16.5V21z"/>
                </svg>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="pass" className="block text-xs text-[var(--muted)]">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-xs text-[var(--muted)] underline"
                >
                  {showPwd ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="pass"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={[
                    "w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 pr-10 outline-none transition focus:ring-4",
                    roleStyles.focus,
                  ].join(" ")}
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                  aria-hidden="true"
                >
                  <path fill="currentColor" d="M12 4a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v6h16v-6a2 2 0 0 0-2-2h-1V9a5 5 0 0 0-5-5"/>
                </svg>
              </div>
            </div>

            <button
              disabled={submitting}
              className={[
                "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold transition hover:brightness-105",
                submitting ? "opacity-70" : "",
                roleStyles.cta,
              ].join(" ")}
              type="submit"
              aria-label={ctaLabel}
            >
              {submitting && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
              )}
              {ctaLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8l8-8z" />
              </svg>
            </button>

            {err && (
              <div
                role="alert"
                className="animate-fade rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-100"
              >
                {err}
              </div>
            )}

            <p className="mt-2 text-xs text-[var(--muted)]">
              Plataforma oficial de la Universidad Nacional Tecnológica de Lima Sur (UNTELS). Si no tienes
              cuenta, solicita acceso a la Oficina de Empleabilidad.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
