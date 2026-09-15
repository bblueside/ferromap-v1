/**
 * requireAuth.middleware.js
 *
 * Guard de autenticación. NO decodifica el token: eso ya lo hizo
 * `jwt_middleware` (global en app.js), que dejó `req.session.user` con el
 * payload del JWT o en `null`.
 *
 * Este middleware SOLO decide: si no hay usuario en la sesión, corta la
 * petición con 401 y nunca llega al controlador. Se aplica ruta por ruta,
 * así cada endpoint declara explícitamente si exige sesión.
 */
export const requireAuth = (req, res, next) => {
    // `jwt_middleware` garantiza que `req.session` existe; `user` es el payload
    // firmado ({ id, user, iat, exp }) o null si la cookie faltaba, venció o
    // no verificó. El `?.` es defensivo por si se reordenan los middlewares.
    if (!req.session?.user) {
        return res.status(401).json({ message: "No autenticado" });
    }

    // Hay sesión válida → seguir al siguiente middleware / controlador.
    next();
};
