"use client";

import type {
  StudentProfile,
  CompanyProfile,
  Offer,
  Application,
  Message,
  Role,
  ApplicationStatus,
} from "./types";

/* =============== Utils de LS =============== */
function lsGet<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function lsSet<T>(k: string, v: T) {
  if (typeof window !== "undefined") localStorage.setItem(k, JSON.stringify(v));
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* =============== Claves =============== */
const K = {
  studentProfiles: "db_student_profiles",
  companyProfiles: "db_company_profiles",
  offers: "db_offers",
  apps: "db_applications",
  msgs: (appId: string) => `db_msgs_${appId}`,
};

/* =========================================================
   SEED: inyecta una oferta por defecto si no existe
   - Empresa: emp-admin  (asegúrate de tener ese usuario en auth.ts)
   - Solo se crea si no está presente (id estable SEED_ID)
========================================================= */
const SEED_ID = "offer_seed_untels_1";

function seedOffersOnce() {
  if (typeof window === "undefined") return;
  const current = lsGet<Offer[]>(K.offers, []);
  const exists = current.some((o) => o.id === SEED_ID);
  if (exists) return;

  const seeded: Offer = {
    id: SEED_ID,
    titulo: "Practicante de Desarrollo Web — Feria UNTELS",
    descripcion:
      "Únete a nuestro equipo para apoyar el desarrollo de una plataforma web responsive (Next.js + Tailwind). " +
      "Ideal para estudiantes que buscan su primera experiencia profesional: trabajo en equipo ágil, mentoría y despliegue continuo.",
    modalidad: "practicas",
    empresaUsername: "emp-admin", // ← usuario de empresa existente en auth.ts
    creadaEn: Date.now() - 1000 * 60 * 60 * 24 * 3, // hace 3 días
  };

  lsSet(K.offers, [...current, seeded]);
}
// Ejecutar el seed en cuanto se importe el módulo (cliente)
seedOffersOnce();

/* =============== Perfiles =============== */
export function saveStudentProfile(p: StudentProfile) {
  const list = lsGet<StudentProfile[]>(K.studentProfiles, []);
  const i = list.findIndex((x) => x.username.toLowerCase() === p.username.toLowerCase());
  if (i >= 0) list[i] = p;
  else list.push(p);
  lsSet(K.studentProfiles, list);
}
export function getStudentProfile(username: string): StudentProfile | null {
  const list = lsGet<StudentProfile[]>(K.studentProfiles, []);
  return list.find((x) => x.username.toLowerCase() === username.toLowerCase()) ?? null;
}

export function saveCompanyProfile(p: CompanyProfile) {
  const list = lsGet<CompanyProfile[]>(K.companyProfiles, []);
  const i = list.findIndex((x) => x.username.toLowerCase() === p.username.toLowerCase());
  if (i >= 0) list[i] = p;
  else list.push(p);
  lsSet(K.companyProfiles, list);
}
export function getCompanyProfile(username: string): CompanyProfile | null {
  const list = lsGet<CompanyProfile[]>(K.companyProfiles, []);
  return list.find((x) => x.username.toLowerCase() === username.toLowerCase()) ?? null;
}

/* =============== Ofertas =============== */
export function listOffers(): Offer[] {
  // Nota: seed ya corrió al importar
  return lsGet<Offer[]>(K.offers, []).sort((a, b) => b.creadaEn - a.creadaEn);
}
export function listOffersByCompany(username: string): Offer[] {
  return listOffers().filter((o) => o.empresaUsername.toLowerCase() === username.toLowerCase());
}
export function createOffer(o: Omit<Offer, "id" | "creadaEn">): Offer {
  const all = listOffers();
  const newO: Offer = { ...o, id: id("offer"), creadaEn: Date.now() };
  all.push(newO);
  lsSet(K.offers, all);
  return newO;
}

/* =============== Postulaciones =============== */
export function listApplicationsByStudent(username: string): Application[] {
  const all = lsGet<Application[]>(K.apps, []);
  return all
    .filter((a) => a.estudianteUsername.toLowerCase() === username.toLowerCase())
    .sort((a, b) => b.creadaEn - a.creadaEn);
}
export function listApplicationsByCompany(username: string): Application[] {
  const all = lsGet<Application[]>(K.apps, []);
  return all
    .filter((a) => a.empresaUsername.toLowerCase() === username.toLowerCase())
    .sort((a, b) => b.creadaEn - a.creadaEn);
}
export function getApplication(appId: string): Application | null {
  const all = lsGet<Application[]>(K.apps, []);
  return all.find((a) => a.id === appId) ?? null;
}
export function applyToOffer(params: { offer: Offer; estudianteUsername: string }): Application {
  const all = lsGet<Application[]>(K.apps, []);
  const already = all.find(
    (a) =>
      a.offerId === params.offer.id &&
      a.estudianteUsername.toLowerCase() === params.estudianteUsername.toLowerCase()
  );
  if (already) return already;

  const app: Application = {
    id: id("app"),
    offerId: params.offer.id,
    offerTitulo: params.offer.titulo,
    empresaUsername: params.offer.empresaUsername,
    estudianteUsername: params.estudianteUsername,
    estado: "enviada",
    creadaEn: Date.now(),
  };
  all.push(app);
  lsSet(K.apps, all);
  return app;
}
export function updateApplicationStatus(appId: string, estado: ApplicationStatus) {
  const all = lsGet<Application[]>(K.apps, []);
  const i = all.findIndex((a) => a.id === appId);
  if (i >= 0) {
    all[i].estado = estado;
    lsSet(K.apps, all);
  }
}

/* =============== Mensajes =============== */
export function listMessages(appId: string): Message[] {
  return lsGet<Message[]>(K.msgs(appId), []).sort((a, b) => a.ts - b.ts);
}
export function addMessage(appId: string, sender: Role, text: string): Message {
  const list = listMessages(appId);
  const m: Message = { id: id("msg"), appId, sender, text, ts: Date.now() };
  list.push(m);
  lsSet(K.msgs(appId), list);
  return m;
}
