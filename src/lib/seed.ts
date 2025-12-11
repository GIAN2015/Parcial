"use client";

import { useEffect } from "react";
import {
  createEvent,
  createNotice,
  createSurvey,
  listEvents,
  listNotices,
  listSurveys,
  upsertGraduateProfile,
} from "./db";

/** Inserta datos base UNTELS si no existen (solo la primera vez) */
export function SeedOnce() {
  useEffect(() => {
    try {
      if (listSurveys().length === 0) {
        createSurvey({
          titulo: "Encuesta de Empleabilidad – Cohorte 2022",
          preguntas: [
            "¿Te encuentras trabajando actualmente?",
            "Sector donde laboras:",
            "Cargo actual:",
            "Tiempo desde que iniciaste en el puesto (meses):",
            "¿Tu trabajo se relaciona con tu carrera?",
          ],
          activa: true,
        });
      }

      if (listEvents().length === 0) {
        createEvent({
          titulo: "UNTELS · Jornada de Seguimiento de Egresados",
          fechaISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            .toISOString()
            .slice(0, 10),
          modalidad: "virtual",
          link: "https://meet.example/untels",
          descripcion: "Reencuentro, networking y oportunidades laborales.",
        });
      }

      if (listNotices().length === 0) {
        createNotice({
          titulo: "Bienvenidos al Sistema de Seguimiento de Egresados – UNTELS",
          cuerpo:
            "Actualiza tu perfil, participa en encuestas y entérate de los próximos eventos.",
        });
      }

      // Perfil demo para egresado1
      upsertGraduateProfile({
        username: "egresado1",
        nombres: "Juan",
        apellidos: "Pérez",
        emailInstitucional: "egresado1@untels.edu.pe",
        carrera: "Ingeniería de Sistemas",
        anioEgreso: 2024,
        telefono: "999-999-999",
        skills: ["SQL", "React", "Git"],
        intereses: ["Desarrollo web", "Cloud"],
        empleoActual: {
          empresa: "Tech Lima",
          cargo: "Practicante TI",
          modalidad: "practicas",
          ciudad: "Lima",
          pais: "Perú",
        },
      });
    } catch {
      /* no-op */
    }
  }, []);

  return null;
}
