import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/services/auth/useAuth"
import { loginSchema } from "./login.schema"
import type { LoginValues } from "./login.schema"

/**
 * Orquesta el formulario de login: validación (zod) + envío contra `useAuth`.
 * Deja a `<LoginForm>` como componente puramente de presentación.
 *
 * No necesita un callback `onSuccess`: al autenticarse, `isAuthenticated`
 * cambia en `<AuthProvider>` y `<App>` desmonta `<Login>` solo.
 */
export function useLogin() {
  const { login } = useAuth()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values)
    } catch (err) {
      form.setError("root", {
        message:
          err instanceof Error
            ? err.message
            : "No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.",
      })
    }
  })

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting }
}
