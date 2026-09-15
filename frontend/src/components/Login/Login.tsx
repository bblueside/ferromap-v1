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
 * bloque de marca + formulario en el panel izquierdo, imagen a sangre en el
 * derecho. Toda la lógica (validación con zod + envío contra `useAuth`) vive
 * en `useLogin`; al autenticarse, `<App>` desmonta `<Login>` solo.
 *
 * Textos de la pantalla (es-CO) escritos directamente en el JSX.
 */
export default function Login() {
  const { form, onSubmit, isSubmitting } = useLogin()
  const { errors } = form.formState

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Panel izquierdo: contenido */}
      <div className="relative z-10 flex w-1/2 shrink-0 flex-col items-center justify-center bg-white px-16 py-14">
        {/* Marca: logos + título + bajada */}
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="Logo de Ferromap" className="mb-5 h-16 w-auto" />
        </div>

        <div className="mb-9 text-center">
          <h1 className="text-argos-navy mb-3 text-[28px] font-semibold leading-tight tracking-tight">
            Censo de ferreterías
          </h1>
          <p className="text-muted-foreground mx-auto max-w-[300px] text-sm leading-relaxed">
            Convierte los datos del canal ferretero en decisiones de mercadeo más
            inteligentes.
          </p>
        </div>

        {/* Formulario de login */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full max-w-[340px] space-y-5 text-left"
        >
          <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@ferromap.co.com"
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
            className="bg-argos-lime text-argos-navy h-11 w-full text-[15px] font-semibold tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>

      {/* Panel derecho: imagen a sangre sobre fondo azul Argos */}
      <div className="bg-argos-navy relative w-1/2 overflow-hidden">
        {/* Imagen decorativa: alt vacío para que los lectores de pantalla la omitan. */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
