import mongoose from "mongoose";

// Promesa de conexión compartida. En Vercel la instancia de la función se
// reutiliza entre peticiones, así que solo se conecta una vez por instancia.
let connection = null;

// No registra nada ni termina el proceso: si la conexión falla, lanza el error
// y decide quien llama (el handler de Vercel responde 500; el servidor local
// se cae con el error).
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;

    connection ??= mongoose.connect(process.env.MONGODB_URI).catch((error) => {
        connection = null; // permite reintentar en la siguiente petición
        throw error;
    });
    await connection;
}

export default connectDB;
