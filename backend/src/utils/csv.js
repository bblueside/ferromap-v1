// parser de CSV: soporta comillas dobles, comas y saltos de linea dentro de la celda
export const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];

        if (inQuotes) {
            if (char === '"') {
                if (clean[i + 1] === '"') {   // comilla escapada ""
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    if (field !== "" || row.length > 0) {   // ultima fila sin salto de linea final
        row.push(field);
        rows.push(row);
    }

    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// convierte una fila en un objeto plano usando los headers del CSV.
// numericFields -> Number, arrayFields -> arreglo separado por comas, vacio -> null / []
export const rowToDocument = (headers, row, { numericFields = new Set(), arrayFields = new Set() } = {}) => {
    const doc = {};

    headers.forEach((header, index) => {
        const raw = (row[index] ?? "").trim();

        if (raw === "") {
            doc[header] = arrayFields.has(header) ? [] : null;
            return;
        }

        if (numericFields.has(header)) {
            const value = Number(raw);
            doc[header] = Number.isNaN(value) ? null : value;
            return;
        }

        if (arrayFields.has(header)) {
            doc[header] = raw.split(",").map((v) => v.trim()).filter(Boolean);
            return;
        }

        doc[header] = raw;
    });

    return doc;
}
