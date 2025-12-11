"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, login, peekRole } from "@/lib/auth";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (a) router.replace("/dashboard");
  }, [router]);

  const role = useMemo<Role | null>(() => peekRole(username), [username]);

  const roleStyles = useMemo(() => {
    if (role === "coordinador") {
      return {
        pill: "border-sky-500/40 bg-sky-500/10 text-sky-100",
        cta: "bg-gradient-to-br from-sky-600 to-indigo-600 text-white",
        focus: "focus:ring-[color:rgba(2,132,199,0.18)] focus:border-sky-500",
      };
    }
    if (role === "egresado") {
      return {
        pill: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
        cta: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white",
        focus: "focus:ring-[color:rgba(16,185,129,0.18)] focus:border-emerald-500",
      };
    }
    return {
        pill: "border-[var(--line)] text-[var(--muted)]",
        cta: "bg-[var(--accent)] text-white",
        focus: "focus:ring-[color:rgba(14,165,163,0.18)] focus:border-[var(--accent)]",
    };
  }, [role]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    const res = login({ username, password });
    if (res.ok) router.push("/dashboard");
    else { setErr(res.error || "Error"); setSubmitting(false); }
  }

  return (
    <main className="grid min-h-[80vh] place-items-center p-6">
      <section className="animate-pop w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#0b928f] text-white font-extrabold">
            U
          </div>
          <div>
            <h1 className="m-0 text-lg font-bold">UNTELS · Seguimiento de Egresados</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Inicia sesión para actualizar tu información, responder encuestas y ver eventos.
            </p>
          </div>
        </div>

        {/* Píldora de rol detectado */}
        <div className="mb-4">
          {username ? (
            <div className={["inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs", roleStyles.pill].join(" ")}>
              {role === "coordinador" ? "Entrarás como Coordinador" : "Entrarás como Egresado"}
            </div>
          ) : (
            <div className="text-xs text-[var(--muted)]">Escribe tu usuario para detectar el perfil</div>
          )}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label htmlFor="user" className="mb-1 block text-xs text-[var(--muted)]">Usuario</label>
            <input
              id="user" type="text" autoComplete="username" value={username}
              onChange={e=>setUsername(e.target.value)} required
              placeholder="egresado1 · egresada.ana · coord"
              className={["w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:ring-4", roleStyles.focus].join(" ")}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="pass" className="block text-xs text-[var(--muted)]">Contraseña</label>
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="text-xs text-[var(--muted)] underline">
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <input
              id="pass" type={showPwd ? "text" : "password"} autoComplete="current-password"
              value={password} onChange={e=>setPassword(e.target.value)} required
              placeholder="12345"
              className={["w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:ring-4", roleStyles.focus].join(" ")}
            />
          </div>

          <button
            disabled={submitting}
            className={["inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold transition hover:brightness-105", submitting ? "opacity-70" : "", roleStyles.cta].join(" ")}
            type="submit"
          >
            {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />}
            Ingresar
          </button>

          {err && (
            <div role="alert" className="animate-fade rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
              {err}
            </div>
          )}

          <p className="mt-2 text-xs text-[var(--muted)]">
            Demo: <b>egresado1 / 12345</b> · <b>coord / 12345</b>
          </p>
        </form>
      </section>
    </main>
  );
}
