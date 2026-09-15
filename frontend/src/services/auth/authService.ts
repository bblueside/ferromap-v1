/**
 * auth/authService.ts
 *
 * Único servicio de autenticación del repo. Habla con el backend Express
 * (auth-only, puerto 3000) vía rutas relativas `/api/users/...`.
 *
 * En desarrollo el dev-server de Vite redirige `/api/users` a
 * http://localhost:3000 (ver `server.proxy` en vite.config.ts) para que la
 * cookie httpOnly `access_token` quede como first-party. En producción se
 * sirve tras el mismo dominio / reverse-proxy. `VITE_AUTH_API_URL` permite
 * forzar un host explícito.
 */

const AUTH_BASE_URL =
  (import.meta.env as Record<string, string | undefined>).VITE_AUTH_API_URL ??
  "/api/users";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface LoginResponse {
  message: string;
  user: AuthUser;
}

/** Extrae el `message` del backend o arma uno a partir del status. */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    if (body?.message) return body.message;
  } catch {
    /* la respuesta no traía cuerpo JSON */
  }
  return `Error ${res.status}: ${res.statusText}`;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // envía/recibe la cookie httpOnly `access_token`
    body: JSON.stringify(credentials),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));

  const data = (await res.json()) as LoginResponse;
  return data.user;
}

/**
 * GET /api/users/me
 *
 * - 200 → hay sesión válida: devuelve el usuario.
 * - 401 → no hay sesión (cookie ausente, vencida o inválida): devuelve `null`.
 *         NO es un error de la app, es el caso "visitante anónimo".
 * - otro → problema real (red, 5xx): se propaga como excepción.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${AUTH_BASE_URL}/me`, {
    method: "GET",
    credentials: "include", // manda la cookie httpOnly `access_token`
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await readErrorMessage(res));

  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function logout(email: string): Promise<void> {
  try {
    await fetch(`${AUTH_BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
  } catch {
    /* logout best-effort: el estado local se limpia igualmente */
  }
}
