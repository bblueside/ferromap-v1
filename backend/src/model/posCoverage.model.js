import mongoose, { Schema } from "mongoose";

// ferreterias por estado de cobertura (coberturaferreteria.csv)
const posCoverageSchema = new Schema(
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
        collection: "pos_coverage"
    }
)

export const PosCoverage = mongoose.model("PosCoverage", posCoverageSchema)
