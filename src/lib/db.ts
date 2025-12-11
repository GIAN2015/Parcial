"use client";

import type {
  GraduateProfile,
  JobRecord,
  Survey,
  SurveyResponse,
  AlumniEvent,
  Notice,
  EventAttendance,
  EventMessage,
  AttendanceStatus,
  Role,
} from "./types";

function lsGet<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}

function lsSet<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const K = {
  profiles: "db_graduate_profiles",
  surveys: "db_surveys",
  responses: "db_survey_responses",
  events: "db_events",
  notices: "db_notices",
  attendance: "db_event_attendance",
  messages: "db_event_messages",
} as const;

/* ================== PERFILES EGRESADOS ================== */

export function upsertGraduateProfile(p: GraduateProfile): GraduateProfile {
  const list = lsGet<GraduateProfile[]>(K.profiles, []);
  const i = list.findIndex((x) => x.username === p.username);
  if (i >= 0) list[i] = p;
  else list.push(p);
  lsSet(K.profiles, list);
  return p;
}

export function getGraduateProfile(username: string): GraduateProfile | null {
  return (
    lsGet<GraduateProfile[]>(K.profiles, []).find(
      (x) => x.username === username
    ) ?? null
  );
}

export function listGraduateProfiles(): GraduateProfile[] {
  return lsGet<GraduateProfile[]>(K.profiles, []).sort((a, b) =>
    (a.apellidos ?? "").localeCompare(b.apellidos ?? "")
  );
}

/* ================== ENCUESTAS ================== */

export function createSurvey(
  s: Omit<Survey, "id" | "creadaEn">
): Survey {
  const all = lsGet<Survey[]>(K.surveys, []);
  const newS: Survey = { ...s, id: id("survey"), creadaEn: Date.now() };
  all.push(newS);
  lsSet(K.surveys, all);
  return newS;
}

export function listSurveys(): Survey[] {
  return lsGet<Survey[]>(K.surveys, []).sort(
    (a, b) => b.creadaEn - a.creadaEn
  );
}

export function getSurvey(idStr: string): Survey | null {
  return listSurveys().find((s) => s.id === idStr) ?? null;
}

export function toggleSurveyActive(idStr: string, active: boolean) {
  const all = lsGet<Survey[]>(K.surveys, []);
  const i = all.findIndex((s) => s.id === idStr);
  if (i >= 0) {
    all[i].activa = active;
    lsSet(K.surveys, all);
  }
}

/* ========= RESPUESTAS DE ENCUESTAS (EGRESADOS) ========= */

export function listResponsesByUser(username: string): SurveyResponse[] {
  return lsGet<SurveyResponse[]>(K.responses, []).filter(
    (r) => r.username === username
  );
}

export function hasResponded(username: string, surveyId: string): boolean {
  return listResponsesByUser(username).some(
    (r) => r.surveyId === surveyId
  );
}

export function submitResponse(
  username: string,
  survey: Survey,
  respuestas: string[]
): SurveyResponse {
  const all = lsGet<SurveyResponse[]>(K.responses, []);
  const dup = all.find(
    (r) => r.username === username && r.surveyId === survey.id
  );
  if (dup) return dup;

  const resp: SurveyResponse = {
    id: id("resp"),
    surveyId: survey.id,
    username,
    respuestas,
    enviadaEn: Date.now(),
  };
  all.push(resp);
  lsSet(K.responses, all);
  return resp;
}

/* ================== EVENTOS ================== */

export function createEvent(
  e: Omit<AlumniEvent, "id" | "creadaEn">
): AlumniEvent {
  const all = lsGet<AlumniEvent[]>(K.events, []);
  const newE: AlumniEvent = { ...e, id: id("event"), creadaEn: Date.now() };
  all.push(newE);
  lsSet(K.events, all);
  return newE;
}

export function listEvents(): AlumniEvent[] {
  return lsGet<AlumniEvent[]>(K.events, []).sort((a, b) =>
    a.fechaISO.localeCompare(b.fechaISO)
  );
}

/* ================== COMUNICADOS ================== */

export function createNotice(
  n: Omit<Notice, "id" | "creadaEn">
): Notice {
  const all = lsGet<Notice[]>(K.notices, []);
  const newN: Notice = { ...n, id: id("notice"), creadaEn: Date.now() };
  all.push(newN);
  lsSet(K.notices, all);
  return newN;
}

export function listNotices(): Notice[] {
  return lsGet<Notice[]>(K.notices, []).sort(
    (a, b) => b.creadaEn - a.creadaEn
  );
}

/* =========== ASISTENCIA A EVENTOS (SEGUIMIENTO) =========== */

export function listAttendanceByEvent(eventId: string): EventAttendance[] {
  return lsGet<EventAttendance[]>(K.attendance, [])
    .filter((a) => a.eventId === eventId)
    .sort((a, b) => a.registradoEn - b.registradoEn);
}

export function registerAttendance(
  username: string,
  eventId: string,
  estado: AttendanceStatus,
  comentario?: string
): EventAttendance {
  const all = lsGet<EventAttendance[]>(K.attendance, []);
  const u = (username ?? "").trim().toLowerCase();
  const idx = all.findIndex(
    (a) => a.eventId === eventId && a.username === u
  );
  const now = Date.now();

  if (idx >= 0) {
    all[idx] = { ...all[idx], estado, comentario, registradoEn: now };
    lsSet(K.attendance, all);
    return all[idx];
  }

  const rec: EventAttendance = {
    id: id("att"),
    eventId,
    username: u,
    estado,
    comentario,
    registradoEn: now,
  };
  all.push(rec);
  lsSet(K.attendance, all);
  return rec;
}

/* =========== MENSAJES / CHAT POR EVENTO =========== */

export function listMessagesByEvent(eventId: string): EventMessage[] {
  return lsGet<EventMessage[]>(K.messages, [])
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => a.enviadaEn - b.enviadaEn);
}

export function addEventMessage(input: {
  eventId: string;
  fromUsername: string;
  fromRole: Role;
  cuerpo: string;
}): EventMessage {
  const all = lsGet<EventMessage[]>(K.messages, []);
  const msg: EventMessage = {
    id: id("msg"),
    eventId: input.eventId,
    fromUsername: input.fromUsername,
    fromRole: input.fromRole,
    cuerpo: input.cuerpo,
    enviadaEn: Date.now(),
  };
  all.push(msg);
  lsSet(K.messages, all);
  return msg;
}
