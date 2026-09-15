import mongoose, { Schema } from "mongoose";

// un documento por archivo GeoJSON de data_ts/layers_map/routes_map (lo carga scripts/import-routes.js)
const routeSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        label: { type: String, required: true, trim: true },
        cities: { type: [String], default: [] },
        sourceFile: { type: String, required: true, trim: true },
        geojson: {
            type: {
                type: String,
                enum: ["FeatureCollection"],
                required: true
            },
            features: { type: [Schema.Types.Mixed], default: [] }
        }
    },
    {
        timestamps: true,
        collection: "routes"
    }
)

export const Route = mongoose.model("Route", routeSchema)
