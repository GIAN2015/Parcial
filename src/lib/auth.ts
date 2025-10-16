"use client";

import type { AuthData, Role } from "./types";

const KEY = "auth";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 h

type UsersMap = Record<string, { password: string; role: Role }>;

const USERS_RAW: UsersMap = {
  // Estudiantes
  EP: { password: "12345", role: "estudiante" },
  "ep@uni.pe": { password: "12345", role: "estudiante" },
  a20230001: { password: "12345", role: "estudiante" },

  // Empresas
  "emp-admin": { password: "12345", role: "empresa" },
  "hr@company.pe": { password: "12345", role: "empresa" },
};

const USERS: UsersMap = Object.fromEntries(
  Object.entries(USERS_RAW).map(([k, v]) => [k.toLowerCase(), v])
);

function normalize(u: string) {
  return (u ?? "").trim().toLowerCase();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isRole(x: unknown): x is Role {
  return x === "empresa" || x === "estudiante";
}

function isValidAuth(a: unknown): a is AuthData {
  if (!isRecord(a)) return false;
  const { username, role, ts } = a;
  if (typeof username !== "string") return false;
  if (!isRole(role)) return false;
  if (typeof ts !== "number" || !Number.isFinite(ts)) return false;
  return Date.now() - ts < TTL_MS;
}

/* UI hint del rol */
export function peekRole(username: string): Role | null {
  const u = normalize(username);
  const fromUsers = USERS[u]?.role ?? null;
  if (fromUsers) return fromUsers;
  if (!u) return null;
  if (u.startsWith("emp-") || u.includes("@company") || u.includes("@corp")) return "empresa";
  return "estudiante";
}

export function login(input: { username: string; password: string }) {
  if (typeof window === "undefined") return { ok: false as const };
  const typed = (input.username ?? "").trim();
  const u = normalize(typed);
  const p = input.password ?? "";

  if (!u || !p) return { ok: false as const, error: "Completa email/usuario y contraseña." };

  const found = USERS[u];
  if (found && found.password === p) {
    const auth: AuthData = { username: typed, role: found.role, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(auth));
    return { ok: true as const };
  }
  return { ok: false as const, error: "Credenciales inválidas." };
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (isValidAuth(raw)) return raw;
    localStorage.removeItem(KEY);
    return null;
  } catch {
    return null;
  }
}
