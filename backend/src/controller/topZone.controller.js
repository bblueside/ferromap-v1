import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { topZone } from "../model/topZones.model.js";
import { parseCSV, rowToDocument } from "../utils/csv.js";

// Zonas sintéticas (backend/data/), agregadas a partir de los CSV de ferreterías
// de cada región: sus `id` coinciden con `Pos.zonaId`.
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const EXAMPLE_CSV_FILES = [
    "zonas_caribe_mock.csv",
    "zonas_orinoquia_mock.csv",
    "zonas_amazonia_mock.csv",
    "zonas_andina_mock.csv",
    "zonas_pacifica_mock.csv",
];

const NUMERIC_FIELDS = new Set(["ferreterias_count", "potential_score", "lat", "lng"]);

// Se parsea una sola vez y se reutiliza en las siguientes peticiones.
let exampleZonesCache = null;

const loadExampleCsv = async (file) => {
    const [header, ...rows] = parseCSV(await readFile(path.join(DATA_DIR, file), "utf-8"));
    const keys = header.map((key) => key.trim());

    return rows.map((row) => rowToDocument(keys, row, { numericFields: NUMERIC_FIELDS }));
};

const loadExampleZones = async () => {
    if (exampleZonesCache) return exampleZonesCache;

    const perRegion = await Promise.all(EXAMPLE_CSV_FILES.map(loadExampleCsv));
    // orden descendente por número de ferreterías: el ranking mezcla las regiones
    exampleZonesCache = perRegion.flat().sort((a, b) => (b.ferreterias_count ?? 0) - (a.ferreterias_count ?? 0));
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

export { getAllTopZones, getAllTopZonesExample, loadExampleZones };
