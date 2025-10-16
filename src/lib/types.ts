export type Role = "empresa" | "estudiante";

export interface AuthData {
  username: string; // como lo tecleó el usuario
  role: Role;
  ts: number;
}

/* Perfiles */
export interface StudentProfile {
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  educacion?: string;
  habilidades?: string[];
  disponibilidad?: string;
  intereses?: string[];
}

export interface CompanyProfile {
  username: string;
  nombreEmpresa: string;
  ruc?: string;
  email: string;
  telefono?: string;
  descripcion?: string;
}

/* Ofertas y postulaciones */
export interface Offer {
  id: string;
  titulo: string;
  descripcion: string;
  modalidad: "practicas" | "junior" | "part-time" | "full-time";
  empresaUsername: string;
  creadaEn: number;
}

export type ApplicationStatus = "enviada" | "en revisión" | "entrevista" | "rechazada" | "aceptada";

export interface Application {
  id: string;
  offerId: string;
  offerTitulo: string;
  empresaUsername: string;
  estudianteUsername: string;
  estado: ApplicationStatus;
  creadaEn: number;
}

/* Mensajes por solicitud */
export interface Message {
  id: string;
  appId: string;
  sender: Role;
  text: string;
  ts: number;
}
