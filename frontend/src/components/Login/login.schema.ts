import { z } from "zod"

/** Contrato de validación del formulario de login. Fuente única de reglas. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export type LoginValues = z.infer<typeof loginSchema>
