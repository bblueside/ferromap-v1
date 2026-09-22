import { Pos } from "../model/pos.model.js";
import { topZone } from "../model/topZones.model.js";
import { loadExamplePos } from "./pos.controller.js";
import { loadExampleZones } from "./topZone.controller.js";

// Estadísticas del Dashboard. Cada handler replica una consulta SQL de referencia
// (tablas `top_zones` y `pos`) como pipeline de Mongo y, en las variantes *Example,
// sobre los CSV sintéticos ya cacheados.

const PRIORITY_ORDER = { Alta: 1, Media: 2, Baja: 3 };
const STATUSES = ["ACTIVO", "VALIDAR", "INACTIVO"];
const RANKING_LIMIT = 10;

const priorityOrder = (priority) => PRIORITY_ORDER[priority] ?? 4;
const percentage = (count, total) => (total ? Math.round((1000 * count) / total) / 10 : 0);

// RANK() OVER (ORDER BY prioridad, potential_score DESC): los empates comparten puesto.
const assignRanking = (zones) => {
    let rank = 0;
    return zones.map((zone, idx) => {
        const prev = zones[idx - 1];
        const tied = prev && prev.prioOrder === zone.prioOrder && prev.potential_score === zone.potential_score;
        if (!tied) rank = idx + 1;
        const { prioOrder, ...rest } = zone;
        return { ...rest, ranking: rank };
    });
};

const sortByPriority = (a, b) =>
    a.prioOrder - b.prioOrder ||
    (b.potential_score ?? 0) - (a.potential_score ?? 0) ||
    (b.ferreterias_count ?? 0) - (a.ferreterias_count ?? 0);

// SELECT status, COUNT(*), porcentaje FROM pos GROUP BY status
// + SELECT departamento, COUNT(*) FILTER (WHERE status = ...) FROM pos GROUP BY departamento
const buildStatusComparison = (byStatusCounts, byDepartamento) => {
    const total = STATUSES.reduce((sum, status) => sum + (byStatusCounts[status] ?? 0), 0);
    return {
        total,
        byStatus: STATUSES.map((status) => ({
            status,
            total: byStatusCounts[status] ?? 0,
            porcentaje: percentage(byStatusCounts[status] ?? 0, total)
        })),
        byDepartamento: byDepartamento.sort((a, b) => b.total - a.total)
    };
};

const getPriorityRanking = async (req, res) => {
    try {
        const countPriority = (priority) => ({
            $size: { $filter: { input: "$pos", cond: { $eq: ["$$this.priority", priority] } } }
        });
        const zones = await topZone.aggregate([
            { $lookup: { from: Pos.collection.name, localField: "id", foreignField: "zonaId", as: "pos" } },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    priority: 1,
                    potential_score: 1,
                    ferreterias_count: 1,
                    pos_alta: countPriority("Alta"),
                    pos_media: countPriority("Media"),
                    pos_baja: countPriority("Baja"),
                    prioOrder: {
                        $switch: {
                            branches: Object.entries(PRIORITY_ORDER).map(([priority, order]) => ({
                                case: { $eq: ["$priority", priority] },
                                then: order
                            })),
                            default: 4
                        }
                    }
                }
            },
            { $sort: { prioOrder: 1, potential_score: -1, ferreterias_count: -1 } },
            { $limit: RANKING_LIMIT }
        ]);
        res.status(200).json(assignRanking(zones));
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

const getPriorityRankingExample = async (req, res) => {
    try {
        const [zones, pos] = await Promise.all([loadExampleZones(), loadExamplePos()]);

        const countsByZone = new Map();
        for (const { zonaId, priority } of pos) {
            const counts = countsByZone.get(zonaId) ?? { pos_alta: 0, pos_media: 0, pos_baja: 0 };
            if (priority === "Alta") counts.pos_alta++;
            else if (priority === "Media") counts.pos_media++;
            else if (priority === "Baja") counts.pos_baja++;
            countsByZone.set(zonaId, counts);
        }

        const ranked = zones
            .map(({ id, name, priority, potential_score, ferreterias_count }) => ({
                id,
                name,
                priority,
                potential_score,
                ferreterias_count,
                ...(countsByZone.get(id) ?? { pos_alta: 0, pos_media: 0, pos_baja: 0 }),
                prioOrder: priorityOrder(priority)
            }))
            .sort(sortByPriority)
            .slice(0, RANKING_LIMIT);

        res.status(200).json(assignRanking(ranked));
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

const getStatusComparison = async (req, res) => {
    try {
        const countStatus = (status) => ({ $sum: { $cond: [{ $eq: ["$status", status] }, 1, 0] } });
        const [statusRows, departamentoRows] = await Promise.all([
            Pos.aggregate([
                { $match: { status: { $in: STATUSES } } },
                { $group: { _id: "$status", total: { $sum: 1 } } }
            ]),
            Pos.aggregate([
                {
                    $group: {
                        _id: "$departamento",
                        activo: countStatus("ACTIVO"),
                        validar: countStatus("VALIDAR"),
                        inactivo: countStatus("INACTIVO"),
                        total: { $sum: 1 }
                    }
                },
                { $project: { _id: 0, departamento: "$_id", activo: 1, validar: 1, inactivo: 1, total: 1 } }
            ])
        ]);

        const byStatusCounts = Object.fromEntries(statusRows.map(({ _id, total }) => [_id, total]));
        res.status(200).json(buildStatusComparison(byStatusCounts, departamentoRows));
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

const getStatusComparisonExample = async (req, res) => {
    try {
        const pos = await loadExamplePos();

        const byStatusCounts = {};
        const departamentos = new Map();
        for (const { status, departamento } of pos) {
            if (STATUSES.includes(status)) byStatusCounts[status] = (byStatusCounts[status] ?? 0) + 1;

            const row = departamentos.get(departamento) ?? { departamento, activo: 0, validar: 0, inactivo: 0, total: 0 };
            if (STATUSES.includes(status)) row[status.toLowerCase()]++;
            row.total++;
            departamentos.set(departamento, row);
        }

        res.status(200).json(buildStatusComparison(byStatusCounts, [...departamentos.values()]));
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        });
    }
}

export { getPriorityRanking, getPriorityRankingExample, getStatusComparison, getStatusComparisonExample };
