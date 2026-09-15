import mongoose, { Schema } from "mongoose";

const zoneSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: { type: String, trim: true },
        ferreterias_count: { type: Number, default: null },
        priority: { type: String, trim: true },
        potential_score: { type: Number, default: null },
        analysis: { type: String, trim: true },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "top_zones"
    }
)

export const topZone = mongoose.model("Zone", zoneSchema)
