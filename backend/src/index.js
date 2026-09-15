import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import app from "./app.js";
import connectDB from "./config/database.js";
import { startServer } from "./config/server.config.js";

dotenv.config({
    path: './.env'
});

// Punto de entrada en Vercel (`backend/vercel.json` enruta todo aquí): se
// asegura la conexión a MongoDB y se delega la petición a Express.
export default async function handler(req, res) {
    try {
        await connectDB();
    } catch {
        return res.status(500).json({ message: "Error conectando a la base de datos" });
    }
    return app(req, res);
}

// Ejecutado directamente (`node src/index.js`, nodemon) → servidor local.
// Vercel solo importa el módulo, así que ahí no se abre ningún puerto.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await startServer();
}
