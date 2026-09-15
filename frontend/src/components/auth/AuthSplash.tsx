import { Loader2 } from "lucide-react";

/**
 * Pantalla neutra mientras `AuthProvider` verifica la cookie `access_token`
 * contra el backend (`GET /api/users/me`). Se muestra en vez de saltar
 * directo a `<Login>`, para no expulsar a un usuario cuya sesión sigue siendo
 * válida solo porque la respuesta todavía no llegó.
 */
export function AuthSplash() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}
