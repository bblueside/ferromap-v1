// Carga todos los datasets de backend/data/ en MongoDB:
//   ferreterias_*.csv -> colección "pos"        (Pos)
//   zonas_*.csv       -> colección "top_zones"  (topZone)
// Antes de insertar vacía ambas colecciones.
//
// Uso:  npm run seed            (vacía e inserta)
//       npm run seed -- --dry-run (solo parsea y muestra el resumen, no toca la BD)
import dotenv from "dotenv";
import mongoose from "mongoose";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Pos } from "../model/pos.model.js";
import { topZone } from "../model/topZones.model.js";
import { parseCSV } from "../utils/csv.js";

const BACKEND_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_DIR = path.join(BACKEND_DIR, "data");

dotenv.config({ path: path.join(BACKEND_DIR, ".env") });

const DRY_RUN = process.argv.includes("--dry-run");

const DATASETS = [
    {
        label: "pos",
        model: Pos,
        prefix: "ferreterias_",
        numericFields: new Set(["lat", "lng", "confidence", "coverage", "temperatura"]),
        arrayFields: new Set(["source_agents"])
    },
    {
        label: "top_zones",
        model: topZone,
        prefix: "zonas_",
        numericFields: new Set(["ferreterias_count", "potential_score", "lat", "lng"]),
        arrayFields: new Set()
    }
];

// El CSV escribe los nulos como "null" y los arreglos como JSON (["A1","A2"]).
const toValue = (key, raw, { numericFields, arrayFields }) => {
    const value = raw.trim();
    if (value === "" || value.toLowerCase() === "null") {
        return arrayFields.has(key) ? [] : null;
    }
    if (numericFields.has(key)) {
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }
    if (arrayFields.has(key)) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
        } catch {
            return value.split(",").map((v) => v.trim()).filter(Boolean);
        }
    }
    return value;
};

const loadCsv = async (file, dataset) => {
    const [header, ...rows] = parseCSV(await readFile(path.join(DATA_DIR, file), "utf-8"));
    const keys = header.map((key) => key.trim());

    return rows.map((values) =>
        Object.fromEntries(keys.map((key, idx) => [key, toValue(key, values[idx] ?? "", dataset)]))
    );
};

// Lee todos los CSV del dataset y descarta ids repetidos (el modelo exige `id` único).
const loadDataset = async (files, dataset) => {
    const byId = new Map();
    let duplicates = 0;
    let withoutId = 0;

    for (const file of files) {
        const docs = await loadCsv(file, dataset);
        console.log(`  ${file}: ${docs.length} filas`);

        for (const doc of docs) {
            if (!doc.id) {
                withoutId++;
                continue;
            }
            if (byId.has(doc.id)) duplicates++;
            byId.set(doc.id, doc); // el último archivo gana
        }
    }

    if (duplicates) console.warn(`  ! ${duplicates} ids duplicados (se conserva la última aparición)`);
    if (withoutId) console.warn(`  ! ${withoutId} filas sin id descartadas`);
    return [...byId.values()];
};

const seed = async () => {
    const csvFiles = (await readdir(DATA_DIR)).filter((f) => f.toLowerCase().endsWith(".csv")).sort();

    const prepared = [];
    for (const dataset of DATASETS) {
        const files = csvFiles.filter((f) => f.startsWith(dataset.prefix));
        console.log(`\n[${dataset.label}] ${files.length} archivos`);
        const docs = await loadDataset(files, dataset);
        console.log(`  total a insertar: ${docs.length}`);
        prepared.push({ ...dataset, docs });
    }

    if (DRY_RUN) {
        console.log("\n--dry-run: no se modificó la base de datos.");
        return;
    }

    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI no está definido en backend/.env");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\nConectado a MongoDB (${mongoose.connection.name})`);

    // Vaciar ambas colecciones antes de insertar cualquier dato.
    for (const { label, model } of prepared) {
        const { deletedCount } = await model.deleteMany({});
        console.log(`[${label}] ${deletedCount} documentos eliminados`);
    }

    for (const { label, model, docs } of prepared) {
        await model.syncIndexes(); // asegura el índice único de `id`
        const inserted = await model.insertMany(docs, { ordered: false });
        console.log(`[${label}] ${inserted.length} documentos insertados`);
    }
};

try {
    await seed();
    console.log("\nSeed completado.");
} catch (error) {
    console.error("\nError en el seed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
