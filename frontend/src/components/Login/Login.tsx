import { Loader2 } from "lucide-react"
import logo from "@/assets/logo.png"
import heroImage from "@/assets/building.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { FormField } from "@/components/ui/form-field"
import { useLogin } from "./useLogin"

/**
 * Pantalla de inicio de sesión. Un único componente de presentación:
 * imagen a sangre de fondo con velo navy y, encima, una tarjeta blanca con
 * marca + formulario. Toda la lógica (validación con zod + envío contra
 * `useAuth`) vive en `useLogin`; al autenticarse, `<App>` desmonta `<Login>` solo.
 *
 * Textos de la pantalla (es-CO) escritos directamente en el JSX.
 */
export default function Login() {
  const { form, onSubmit, isSubmitting } = useLogin()
  const { errors } = form.formState

  return (
    <div className="bg-ferromap-ink relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-8 lg:justify-start lg:px-[120px]">
      {/* Fondo: imagen decorativa (alt vacío) + velo navy que da contraste a la tarjeta. */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="from-ferromap-ink/90 via-ferromap-navy/55 to-ferromap-navy/5 absolute inset-0 bg-linear-to-r from-0% via-45% to-80%" />

      {/* Tarjeta: marca + formulario */}
      <div className="relative w-full max-w-[448px] rounded-[18px] bg-white px-7 pt-10 pb-9 shadow-[0_30px_60px_-20px_rgba(8,15,30,0.55)] sm:px-11 sm:pt-11 sm:pb-10">
        {/* Filete con el degradado del logo */}
        <div
          aria-hidden="true"
          className="from-ferromap-navy to-ferromap-blue-vibrant absolute inset-x-7 top-0 h-1 rounded-b bg-linear-to-r sm:inset-x-11"
        />

        <div className="mb-8 flex flex-col gap-[18px]">
          <img src={logo} alt="Logo de Ferromap" className="h-[38px] w-auto self-start" />
          <div className="flex flex-col gap-2.5">
            <h1 className="text-ferromap-navy text-[28px] leading-[1.15] font-semibold tracking-tight">
              Censo de ferreterías
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
              Convierte los datos del canal ferretero en decisiones de mercadeo más
              inteligentes.
            </p>
          </div>
        </div>

        {/* Formulario de login */}
        <form onSubmit={onSubmit} noValidate className="space-y-5 text-left">
          <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@ferromap.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-10 text-sm"
              {...form.register("email")}
            />
          </FormField>

          <FormField
            id="password"
            label="Contraseña"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="h-10 text-sm"
              {...form.register("password")}
            />
          </FormField>

          {errors.root ? (
            <p role="alert" className="text-destructive text-sm">
              {errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-ferromap-navy hover:bg-ferromap-ink mt-1.5 h-11 w-full text-[15px] font-semibold tracking-wide text-white transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-white" />
                Iniciando sesión…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
