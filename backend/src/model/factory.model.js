import mongoose, { Schema } from "mongoose";

const factorySchema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        planta: { type: String, trim: true },
        ciudad: { type: String, trim: true },
        departamento: { type: String, trim: true },
        longitud: { type: Number, default: null },
        latitud: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "factory"
    }
)

export const Factory = mongoose.model("Factory", factorySchema)
