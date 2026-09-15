// Middleware genérico de validación con Zod.
// Recibe un schema y valida req.body; si pasa, reemplaza req.body
// con los datos ya parseados/normalizados. Si falla, responde 400
// con el detalle de cada campo.

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            campo: issue.path.join(".") || "(body)",
            mensaje: issue.message,
        }));

        return res.status(400).json({
            message: "Datos inválidos",
            errors,
        });
    }

    req.body = result.data;
    next();
};
