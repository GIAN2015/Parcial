"use client";

import Protected from "@/components/Protected";
import { getAuth } from "@/lib/auth";
import { listApplicationsByStudent, listApplicationsByCompany } from "@/lib/db";
import type { Application } from "@/lib/types";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function PostulacionesPage() {
  const auth = getAuth();
  const isEmpresa = auth?.role === "empresa";

  let apps: Application[] = [];
  if (auth) {
    apps = isEmpresa ? listApplicationsByCompany(auth.username) : listApplicationsByStudent(auth.username);
  }

  return (
    <Protected>
      <main className="mx-auto max-w-5xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <BackButton />
          <span className="text-xs text-[var(--muted)]">{isEmpresa ? "Gestiona tus procesos" : "Monitorea el avance de tus solicitudes"}</span>
        </div>

        <h1 className="text-2xl font-bold">{isEmpresa ? "Postulaciones recibidas" : "Mis postulaciones"}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isEmpresa
            ? "Revisa y actualiza el estado para mantener informados a los candidatos."
            : "Consulta estados y coordina con la empresa cuando sea necesario."}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {apps.length === 0 ? (
            <div className="animate-fade rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              {isEmpresa ? "Aún no recibes postulaciones." : "Aún no has postulado a ninguna oferta."}
            </div>
          ) : apps.map(a => (
            <Link href={`/solicitudes/${a.id}`} key={a.id} className="animate-fade rounded-2xl border border-[var(--line)] p-4 transition hover:border-[var(--accent)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-semibold">{a.offerTitulo}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {isEmpresa ? `Estudiante: ${a.estudianteUsername}` : `Empresa: ${a.empresaUsername}`} · Estado: <b>{a.estado}</b>
                  </div>
                </div>
                <div className="text-xs text-[var(--muted)]">{new Date(a.creadaEn).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </Protected>
  );
}
