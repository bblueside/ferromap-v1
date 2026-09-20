import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { topZone } from "../model/topZones.model.js";
import { parseCSV, rowToDocument } from "../utils/csv.js";

// Zonas sintéticas de la Región Caribe (backend/data/), agregadas a partir de
// ferreterias_caribe_mock_500.csv: sus `id` coinciden con `Pos.zonaId`.
const EXAMPLE_CSV_PATH = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../data/zonas_caribe_mock.csv"
);

const NUMERIC_FIELDS = new Set(["ferreterias_count", "potential_score", "lat", "lng"]);

// Se parsea una sola vez y se reutiliza en las siguientes peticiones.
let exampleZonesCache = null;

const loadExampleZones = async () => {
    if (exampleZonesCache) return exampleZonesCache;

    const [header, ...rows] = parseCSV(await readFile(EXAMPLE_CSV_PATH, "utf-8"));
    const keys = header.map((key) => key.trim());

    exampleZonesCache = rows.map((row) => rowToDocument(keys, row, { numericFields: NUMERIC_FIELDS }));
    return exampleZonesCache;
};


const getAllTopZones = async (req, res) => {
    try {
        const allTopZones = await topZone.find();
        res.status(200).json(allTopZones);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

const getAllTopZonesExample = async (req, res) => {
    try {
        const allTopZones = await loadExampleZones();
        res.status(200).json(allTopZones);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

export { getAllTopZones, getAllTopZonesExample };
