import mongoose, { Schema } from "mongoose";

const kpiSchema = new Schema(
    {
        metric: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        value: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "kpi"
    }
)

export const KPI = mongoose.model("Kpi", kpiSchema)
