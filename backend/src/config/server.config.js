import app from "../app.js";
import connectDB from "./database.js";

// Servidor HTTP para desarrollo local (`npm run dev` / `npm start`). En Vercel
// no se usa: allí cada petición entra por el handler de `src/index.js`.
// Los errores (conexión a MongoDB, puerto ocupado) no se capturan: Node los
// muestra y termina el proceso.
export const startServer = async () => {
  await connectDB();

  // Express 5 pasa al callback el error de arranque del servidor, si lo hay.
  app.listen(process.env.PORT, (error) => {
    if (error) throw error;
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
  });
}
