import mongoose, { Schema } from "mongoose";

// una fila por ejecucion de agente: un mismo agente puede tener varias corridas, run_id es la clave unica
const agentLogSchema = new Schema(
    {
        agent: {
            type: String,
            required: true,
            trim: true
        },
        run_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        status: {
            type: String,
            required: true,
            trim: true
        },
        message: { type: String, default: null },
        metric_records_in: { type: Number, default: null },
        metric_records_enriched: { type: Number, default: null },
        metric_records_failed: { type: Number, default: null },
        metric_zones_generated: { type: Number, default: null },
        metric_routes_generated: { type: Number, default: null },
        metric_gaps_detected: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "agents_log"
    }
)

export const AgentLog = mongoose.model("AgentLog", agentLogSchema)
