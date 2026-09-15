import mongoose, { Schema } from "mongoose";

// ferreterias atendidas por TuNegocio vs total por departamento (tunegociovsferreterias.csv)
const posCoverageGapSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        tunegocio: { type: Number, default: null },
        total: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "pos_coverage_gap"
    }
)

export const PosCoverageGap = mongoose.model("pos_coverage_gap", posCoverageGapSchema)
