"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { addMessage, getApplication, listMessages, updateApplicationStatus } from "@/lib/db";
import type { Application, Message } from "@/lib/types";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton";

export default function SolicitudDetailPage() {
  const params = useParams<{ id: string }>();
  const auth = getAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const isEmpresa = auth?.role === "empresa";

  useEffect(() => {
    if (!params?.id) return;
    const a = getApplication(params.id);
    setApp(a);
    setMsgs(listMessages(params.id));
  }, [params?.id]);

  function send() {
    if (!app || !auth || !text.trim()) return;
    addMessage(app.id, auth.role, text.trim());
    setMsgs(listMessages(app.id));
    setText("");
  }

  function cambiarEstado(nuevo: Application["estado"]) {
    if (!app) return;
    updateApplicationStatus(app.id, nuevo);
    setApp(getApplication(app.id));
  }

  return (
    <Protected>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <BackButton />
          <span className="text-xs text-[var(--muted)]">Comunícate y da seguimiento al proceso.</span>
        </div>

        {!app || !auth ? (
          <div className="animate-fade grid min-h-[40vh] place-items-center">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">Cargando…</div>
          </div>
        ) : (
          <section className="animate-fade rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-base font-semibold">{app.offerTitulo}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {isEmpresa ? `Estudiante: ${app.estudianteUsername}` : `Empresa: ${app.empresaUsername}`} · Estado: <b>{app.estado}</b>
                </div>
              </div>

              {isEmpresa && (
                <div className="flex flex-wrap gap-2">
                  {["en revisión", "entrevista", "rechazada", "aceptada"].map(s => (
                    <button key={s} onClick={() => cambiarEstado(s as Application["estado"])}
                      className="rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs transition hover:border-[var(--accent)]">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mensajes */}
            <div className="mt-4 space-y-2">
              {msgs.length === 0 && (
                <div className="text-sm text-[var(--muted)]">No hay mensajes aún. Escribe el primero para coordinar detalles.</div>
              )}
              {msgs.map(m => (
                <div key={m.id}
                  className={[
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    m.sender === "empresa"
                      ? "ml-auto border border-sky-600/40 bg-sky-600/10"
                      : "border border-emerald-600/40 bg-emerald-600/10",
                  ].join(" ")}
                >
                  <div className="text-xs opacity-70">{m.sender}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="mt-3 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="flex-1 rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(99,102,241,0.15)]" />
              <button onClick={send} className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-105">
                Enviar
              </button>
            </div>
          </section>
        )}
      </main>
    </Protected>
  );
}
