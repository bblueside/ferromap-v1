import mongoose, { Schema } from "mongoose";

const posSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        zonaId: { type: String, trim: true },
        municipio: { type: String, trim: true },
        name: { type: String, trim: true },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        status: { type: String, trim: true },
        address: { type: String, trim: true },
        priority: { type: String, trim: true },
        size: { type: String, trim: true },
        confidence: { type: Number, default: null },
        coverage: { type: Number, default: null },
        quality: { type: String, trim: true },
        phone: { type: String, default: null, trim: true },
        departamento: { type: String, trim: true },
        source_url: { type: String, default: null, trim: true },
        source: { type: String, trim: true },
        categoria: { type: String, trim: true },
        NIT: { type: String, default: null, trim: true },
        temperatura: { type: Number, default: null },
        gap_nivel: { type: String, trim: true },
        accion_recomendada: { type: String, trim: true },
        source_agents: { type: [String], default: [] }
    },
    {
        timestamps: true,
        collection: "pos"
    }
)

export const Pos = mongoose.model("Pos", posSchema)
