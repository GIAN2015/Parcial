"use client";

import type { AuthData, Role } from "./types";

const KEY = "auth";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

type UsersMap = Record<string, { password: string; role: Role }>;

const BASE_USERS: UsersMap = {
  // Egresados demo
  "egresado1": { password: "12345", role: "egresado" },
  "egresada.ana": { password: "12345", role: "egresado" },
  // Coordinación UNTELS
  "coord": { password: "12345", role: "coordinador" },
};

const USERS_KEY = "auth_users_v1";

function norm(u: string) { return (u ?? "").trim().toLowerCase(); }

function loadUsers(): UsersMap {
  if (typeof window === "undefined") {
    return { ...BASE_USERS };
  }
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return { ...BASE_USERS };
    const parsed = JSON.parse(raw) as UsersMap;
    return { ...BASE_USERS, ...parsed };
  } catch {
    return { ...BASE_USERS };
  }
}

function saveUsers(users: UsersMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Solo para mostrar “entrarás como coordinador/egresado” según el usuario escrito */
export function peekRole(username: string): Role | null {
  const u = norm(username);
  if (!u) return null;
  if (u.includes("coord") || u.includes("admin")) return "coordinador";
  return "egresado";
}

/** LOGIN */
export function login(input: { username: string; password: string }) {
  if (typeof window === "undefined") return { ok: false as const };

  const u = norm(input.username);
  const p = input.password ?? "";
  const users = loadUsers();
  const found = users[u];

  if (found && found.password === p) {
    const data: AuthData = { username: u, role: found.role, ts: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return { ok: true as const };
  }

  return { ok: false as const, error: "Usuario o contraseña incorrectos." };
}

/** SOLO COORDINADOR: crear cuentas de egresados */
export function createUserAccount(
  username: string,
  password: string,
  role: Role = "egresado"
): { ok: true } | { ok: false; error?: string } {
  if (typeof window === "undefined") {
    return { ok: false, error: "Solo disponible en el navegador." };
  }

  const u = norm(username);
  if (!u || !password) {
    return { ok: false, error: "Usuario y contraseña son obligatorios." };
  }

  const users = loadUsers();
  if (users[u]) {
    return { ok: false, error: "Ya existe un usuario con ese nombre." };
  }

  users[u] = { password, role };
  saveUsers(users);

  return { ok: true };
}

/** LEER SESIÓN */
export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthData;
    if (!data?.username || !data?.role || typeof data.ts !== "number") return null;
    if (Date.now() - data.ts > TTL_MS) { logout(); return null; }
    return data;
  } catch {
    return null;
  }
}

/** LOGOUT */
export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
