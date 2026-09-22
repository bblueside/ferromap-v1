import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Pos } from "../model/pos.model.js";
import { parseCSV } from "../utils/csv.js";

// Datasets sintéticos de ferreterías (backend/data/): se agregan todas las regiones.
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const EXAMPLE_CSV_FILES = [
    "ferreterias_caribe_mock_500.csv",
    "ferreterias_orinoquia_mock_400.csv",
    "ferreterias_amazonia_mock_500.csv",
    "ferreterias_andina_mock_1000.csv",
    "ferreterias_pacifica_mock_300.csv",
];

// Columnas numéricas según pos.model.js; el resto se deja como string.
const NUMERIC_FIELDS = new Set(["lat", "lng", "confidence", "coverage", "temperatura"]);

// Se parsea una sola vez y se reutiliza en las siguientes peticiones.
let examplePosCache = null;

// El CSV escribe los nulos como "null" y source_agents como JSON (["A1","A2"]).
const toPosValue = (key, raw) => {
    const value = raw.trim();
    if (value === "" || value.toLowerCase() === "null") {
        return key === "source_agents" ? [] : null;
    }
    if (NUMERIC_FIELDS.has(key)) {
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }
    if (key === "source_agents") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
        } catch {
            return [value];
        }
    }
    return value;
};

const loadExampleCsv = async (file) => {
    const [header, ...rows] = parseCSV(await readFile(path.join(DATA_DIR, file), "utf-8"));
    const keys = header.map((key) => key.trim());

    return rows.map((values) =>
        Object.fromEntries(keys.map((key, idx) => [key, toPosValue(key, values[idx] ?? "")]))
    );
};

const loadExamplePos = async () => {
    if (examplePosCache) return examplePosCache;

    const perRegion = await Promise.all(EXAMPLE_CSV_FILES.map(loadExampleCsv));
    examplePosCache = perRegion.flat();
    return examplePosCache;
};


const getAllPos = async (req, res) => {
    try {
        const Allpos = await Pos.find();
        res.status(200).json(Allpos);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

const getAllPosExample = async (req, res) => {
    try {
        const Allpos = await loadExamplePos();
        res.status(200).json(Allpos);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

export { getAllPos, getAllPosExample };
