import { RouterProvider } from "react-router-dom"
import { router } from "./routes/routes"
import { AuthProvider } from "./services/auth/AuthProvider"

/**
 * `AuthProvider` rehidrata la sesión y expone `status` vía `useAuth()`.
 * El propio router (ver `routes/routes.tsx`) decide, ruta por ruta, si te
 * deja pasar (`/mapa-interactivo`, `/control-operativo`, `/dashboard`) o te
 * manda a `/login` — por eso aquí ya no hay un switch manual de pantallas.
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
