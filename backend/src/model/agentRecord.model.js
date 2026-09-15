import mongoose, { Schema } from "mongoose";

// registros aportados por cada tipo de agente (registrosagente.csv)
const agentRecordSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        quantity: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "agent_records"
    }
)

export const AgentRecord = mongoose.model("AgentRecord", agentRecordSchema)
