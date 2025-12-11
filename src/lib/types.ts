export type Role = "egresado" | "coordinador";

export interface AuthData {
  username: string;
  role: Role;
  ts: number; // epoch ms
}

/** PERFIL DEL EGRESADO */
export interface GraduateProfile {
  username: string;          // = auth.username
  dni?: string;
  nombres?: string;
  apellidos?: string;
  emailInstitucional?: string;
  emailPersonal?: string;
  telefono?: string;
  carrera?: string;
  anioEgreso?: number;
  direccion?: string;
  linkedin?: string;
  skills?: string[];
  intereses?: string[];
  empleoActual?: JobRecord | null;
}

export interface JobRecord {
  empresa: string;
  cargo: string;
  sector?: string;
  modalidad?: "practicas" | "junior" | "full-time" | "part-time";
  ciudad?: string;
  pais?: string;
  desde?: number; // epoch ms
}

/** ENCUESTAS */
export interface Survey {
  id: string;
  titulo: string;
  preguntas: string[];
  activa: boolean;
  creadaEn: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  username: string;      // egresado
  respuestas: string[];  // 1:1 con preguntas
  enviadaEn: number;
}

/** EVENTOS */
export interface AlumniEvent {
  id: string;
  titulo: string;
  fechaISO: string; // YYYY-MM-DD
  modalidad: "virtual" | "presencial";
  link?: string;
  lugar?: string;
  descripcion?: string;
  creadaEn: number;
}

/** ESTADO ASISTENCIA EVENTOS */
export type AttendanceStatus = "si" | "no" | "talvez";

export interface EventAttendance {
  id: string;
  eventId: string;
  username: string;
  estado: AttendanceStatus;
  comentario?: string;
  registradoEn: number;
}

/** MENSAJES (CHAT) POR EVENTO */
export interface EventMessage {
  id: string;
  eventId: string;
  fromUsername: string;
  fromRole: Role;
  cuerpo: string;
  enviadaEn: number;
}

/** COMUNICADOS */
export interface Notice {
  id: string;
  titulo: string;
  cuerpo: string;
  creadaEn: number;
}
