"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { getAuth } from "@/lib/auth";
import { getSurvey, hasResponded, submitResponse } from "@/lib/db";
import type { Survey } from "@/lib/types";

export default function SurveyAnswerPage({ params }: { params: { id: string } }) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const s = getSurvey(params.id);
    setSurvey(s);
    const a = getAuth();
    if (a && s && hasResponded(a.username, s.id)) setDisabled(true);
    if (s) setAnswers(new Array(s.preguntas.length).fill(""));
  }, [params.id]);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!survey) return;
    const a = getAuth(); if (!a) return;
    if (hasResponded(a.username, survey.id)) { setDisabled(true); return; }
    submitResponse(a.username, survey, answers);
    alert("Respuesta enviada ✔");
    setDisabled(true);
  }

  return (
    <Protected allowedRoles={["egresado"]}>
      <main className="mx-auto max-w-3xl p-5">
        <div className="mb-4"><BackButton /></div>
        {!survey ? (
          <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">Encuesta no encontrada.</div>
        ) : (
          <form onSubmit={onSend} className="grid gap-4">
            <h1 className="m-0 text-2xl font-extrabold">{survey.titulo}</h1>
            {survey.preguntas.map((q, i)=>(
              <label key={i} className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">{i+1}. {q}</span>
                <input
                  disabled={disabled}
                  className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:rgba(14,165,163,0.18)]"
                  value={answers[i] ?? ""} onChange={e=>{
                    const next = [...answers]; next[i] = e.target.value; setAnswers(next);
                  }}
                />
              </label>
            ))}
            <div className="flex justify-end">
              <button disabled={disabled} className={["inline-flex h-11 items-center justify-center rounded-xl px-5 font-semibold", disabled ? "cursor-not-allowed border border-[var(--line)] text-[var(--muted)]" : "bg-[var(--accent)] text-white hover:brightness-105"].join(" ")}>
                {disabled ? "Ya respondida ✓" : "Enviar respuestas"}
              </button>
            </div>
          </form>
        )}
      </main>
    </Protected>
  );
}
