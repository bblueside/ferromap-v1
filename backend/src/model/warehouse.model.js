import mongoose, { Schema } from "mongoose";

const warehouseSchema = new Schema(
    {
        node_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombre: { type: String, trim: true },
        planta: { type: String, trim: true },
        ciudad: { type: String, trim: true },
        departamento: { type: String, trim: true },
        tipo_cemento: { type: String, trim: true },
        node_type: { type: String, trim: true },
        status_validation: { type: String, trim: true },
        product_focus: { type: String, trim: true },
        coordinate_precision: { type: String, trim: true },
        confidence_score: { type: Number, default: null },
        address_note: { type: String, default: null, trim: true },
        notes: { type: String, default: null, trim: true },
        longitud: { type: Number, default: null },
        latitud: { type: Number, default: null }
    },
    {
        timestamps: true,
        collection: "warehouse"
    }
)

export const Warehouse = mongoose.model("Warehouse", warehouseSchema)
