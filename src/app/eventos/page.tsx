"use client";

import { useEffect, useState, type FormEvent } from "react";
import Protected from "@/components/Protected";
import BackButton from "@/components/BackButton";
import { getAuth } from "@/lib/auth";
import {
  createEvent,
  listEvents,
  listAttendanceByEvent,
  registerAttendance,
  listMessagesByEvent,
  addEventMessage,
} from "@/lib/db";
import type {
  AlumniEvent,
  AuthData,
  EventAttendance,
  EventMessage,
  AttendanceStatus,
} from "@/lib/types";

export default function EventosPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, EventAttendance[]>
  >({});
  const [messages, setMessages] = useState<Record<string, EventMessage[]>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>(
    {}
  );
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  // Form nuevo evento (coordinador)
  const [titulo, setTitulo] = useState("");
  const [fechaISO, setFechaISO] = useState("");
  const [modalidad, setModalidad] = useState<"virtual" | "presencial">(
    "virtual"
  );
  const [link, setLink] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const a = getAuth();
    setAuth(a);
    const evs = listEvents();
    setEvents(evs);

    const attMap: Record<string, EventAttendance[]> = {};
    const msgMap: Record<string, EventMessage[]> = {};
    evs.forEach((e) => {
      attMap[e.id] = listAttendanceByEvent(e.id);
      msgMap[e.id] = listMessagesByEvent(e.id);
    });
    setAttendance(attMap);
    setMessages(msgMap);
  }, []);

  const isCoord = auth?.role === "coordinador";

  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!titulo || !fechaISO) return;

    const ev = createEvent({
      titulo,
      fechaISO,
      modalidad,
      link: link || undefined,
      lugar: lugar || undefined,
      descripcion: descripcion || undefined,
    });

    setTitulo("");
    setFechaISO("");
    setLink("");
    setLugar("");
    setDescripcion("");

    setEvents((prev) => [...prev, ev]);
    setAttendance((prev) => ({ ...prev, [ev.id]: [] }));
    setMessages((prev) => ({ ...prev, [ev.id]: [] }));
  }

  function handleAttendance(eventId: string, estado: AttendanceStatus) {
    if (!auth) return;
    const rec = registerAttendance(auth.username, eventId, estado);
    setAttendance((prev) => {
      const prevList = prev[eventId] ?? [];
      const filtered = prevList.filter((a) => a.username !== rec.username);
      return { ...prev, [eventId]: [...filtered, rec] };
    });
  }

  function handleSendMessage(eventId: string) {
    if (!auth) return;
    const txt = (messageDrafts[eventId] ?? "").trim();
    if (!txt) return;
    const msg = addEventMessage({
      eventId,
      fromUsername: auth.username,
      fromRole: auth.role,
      cuerpo: txt,
    });
    setMessages((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] ?? []), msg],
    }));
    setMessageDrafts((prev) => ({ ...prev, [eventId]: "" }));
  }

  return (
    <Protected>
      <main className="mx-auto max-w-5xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <div className="text-sm text-[var(--muted)]">
            Eventos y actividades de seguimiento
          </div>
        </div>

        {/* SOLO COORDINADOR: crear eventos */}
        {isCoord && (
          <section className="mb-6 rounded-2xl border border-[var(--line)] p-4">
            <div className="text-base font-semibold">Nuevo evento</div>
            <form
              onSubmit={create}
              className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Input label="Título" value={titulo} onChange={setTitulo} />
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">Fecha</span>
                <input
                  type="date"
                  value={fechaISO}
                  onChange={(e) => setFechaISO(e.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
                />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--muted)]">Modalidad</span>
                <select
                  value={modalidad}
                  onChange={(e) =>
                    setModalidad(e.target.value as "virtual" | "presencial")
                  }
                  className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
                >
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </select>
              </label>
              <Input
                label="Link (si virtual)"
                value={link}
                onChange={setLink}
              />
              <Input
                label="Lugar (si presencial)"
                value={lugar}
                onChange={setLugar}
              />
              <label className="grid gap-1 text-xs sm:col-span-2">
                <span className="text-[var(--muted)]">Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="min-h-[80px] rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
                />
              </label>
              <div className="sm:col-span-2 flex justify-end">
                <button className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-white hover:brightness-105">
                  Crear
                </button>
              </div>
            </form>
          </section>
        )}

        {/* LISTA DE EVENTOS + ASISTENCIA + CHAT */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {events.map((e) => {
            const attList = attendance[e.id] ?? [];
            const msgList = messages[e.id] ?? [];
            const myAtt =
              auth &&
              attList.find(
                (a) => a.username === auth.username.toLowerCase()
              );
            const countSi = attList.filter((a) => a.estado === "si").length;
            const countNo = attList.filter((a) => a.estado === "no").length;
            const countTalvez = attList.filter(
              (a) => a.estado === "talvez"
            ).length;

            return (
              <div
                key={e.id}
                className="animate-fade rounded-2xl border border-[var(--line)] p-4"
              >
                <div className="text-base font-semibold">{e.titulo}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {e.fechaISO} ·{" "}
                  {e.modalidad === "virtual" ? "Virtual" : "Presencial"}
                </div>
                {e.modalidad === "virtual" && e.link && (
                  <a
                    className="mt-2 inline-block text-sm underline"
                    href={e.link}
                    target="_blank"
                  >
                    Enlace
                  </a>
                )}
                {e.modalidad === "presencial" && e.lugar && (
                  <div className="mt-2 text-sm">{e.lugar}</div>
                )}
                {e.descripcion && (
                  <p className="mt-2 text-sm opacity-90">{e.descripcion}</p>
                )}

                {/* Asistencia del egresado */}
                {auth?.role === "egresado" && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs text-[var(--muted)]">
                      Confirma tu asistencia:
                      {myAtt && (
                        <span className="ml-1 font-semibold">
                          {myAtt.estado === "si"
                            ? "Asistirás"
                            : myAtt.estado === "no"
                            ? "No podrás asistir"
                            : "Tal vez asistirás"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAttendance(e.id, "si")}
                        className="rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                      >
                        Asistiré
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendance(e.id, "no")}
                        className="rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                      >
                        No podré
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendance(e.id, "talvez")}
                        className="rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                      >
                        Tal vez
                      </button>
                    </div>
                  </div>
                )}

                {/* Resumen para coordinador */}
                {auth?.role === "coordinador" && (
                  <div className="mt-3 text-xs text-[var(--muted)]">
                    <div>
                      <b>Asistirán:</b> {countSi}
                    </div>
                    <div>
                      <b>No podrán:</b> {countNo}
                    </div>
                    <div>
                      <b>Tal vez:</b> {countTalvez}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenEventId(openEventId === e.id ? null : e.id)
                    }
                    className="text-xs text-[var(--accent)] underline"
                  >
                    {openEventId === e.id
                      ? "Ocultar seguimiento y chat"
                      : "Ver seguimiento y chat"}
                  </button>
                </div>

                {openEventId === e.id && (
                  <div className="mt-3 rounded-xl border border-[var(--line)]/70 p-3">
                    <div className="mb-2 text-xs text-[var(--muted)]">
                      Mensajes sobre este evento
                    </div>
                    <div className="max-h-40 space-y-2 overflow-y-auto text-xs">
                      {msgList.length === 0 && (
                        <div className="text-[var(--muted)]">
                          Aún no hay mensajes.
                        </div>
                      )}
                      {msgList.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-lg bg-black/20 px-2 py-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--muted)]">
                              {m.fromUsername} · {m.fromRole}
                            </span>
                            <span className="text-[var(--muted)]">
                              {new Date(m.enviadaEn).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-[0.75rem]">
                            {m.cuerpo}
                          </div>
                        </div>
                      ))}
                    </div>

                    {auth && (
                      <form
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          handleSendMessage(e.id);
                        }}
                        className="mt-2 flex gap-2"
                      >
                        <input
                          value={messageDrafts[e.id] ?? ""}
                          onChange={(ev) =>
                            setMessageDrafts((prev) => ({
                              ...prev,
                              [e.id]: ev.target.value,
                            }))
                          }
                          placeholder="Escribe un mensaje para coordinación o egresados…"
                          className="flex-1 rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:rgba(14,165,163,0.45)]"
                        />
                        <button className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white hover:brightness-105">
                          Enviar
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </Protected>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <input
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
