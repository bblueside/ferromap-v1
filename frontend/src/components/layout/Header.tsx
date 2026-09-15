import { ChevronDown, Loader2, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/services/auth/useAuth";
import logo from "@/assets/logo.png"

// Pestañas de navegación: label visible + ruta a la que apuntan. Vive aquí
// porque es el único lugar que las pinta; `routes/routes.tsx` es quien las
// registra como rutas reales.
const NAV_LINKS = [
  { to: "/control-operativo", label: "Control Operativo" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/mapa-interactivo", label: "Mapa interactivo" },
] as const;

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { pathname } = useLocation();

  // Cierra la sesión contra el backend (`POST /api/users/logout`, que limpia la
  // cookie httpOnly `access_token`). Al resolverse, `isAuthenticated` pasa a
  // `false` en `<AuthProvider>` y `<AppContent>` monta `<Login>` solo.
  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-8 pointer-events-auto">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Ferromap Logo" className="h-7" />
      </div>

      <nav className="flex items-center space-x-8">
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className="ui-nav-link" aria-current={pathname === to ? "page" : undefined}>
            {label}
          </Link>
        ))}

        <div className="flex items-center gap-2 pl-4 relative" ref={dropdownRef}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-900">
            <User className="h-4 w-4" />
          </div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
          >
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center px-4 py-2 text-sm hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
