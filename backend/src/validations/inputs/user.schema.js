import { z } from "zod";

// Validaciones de User con Zod. Los mensajes van en español porque
// se exponen directamente al cliente.

const trimmedLower = (schema) =>
    z.preprocess(
        (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
        schema,
    );

const username = trimmedLower(
    z
        .string({ error: "El nombre de usuario es obligatorio" })
        .min(1, "El nombre de usuario debe contener más caracteres")
        .max(30, "El nombre de usuario no puede superar los 30 caracteres"),
);

const email = trimmedLower(
    z.email({
        error: (issue) =>
            issue.input === undefined
                ? "El correo es obligatorio"
                : "El correo no tiene un formato válido",
    }),
);

const password = z
    .string({ error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede superar los 50 caracteres");

export const registerSchema = z.object({
    username,
    email,
    password,
});

export const loginSchema = z.object({
    email,
    password: z
        .string({ error: "La contraseña es obligatoria" })
        .min(1, "La contraseña es obligatoria"),
});

export const logoutSchema = z.object({
    email,
});
