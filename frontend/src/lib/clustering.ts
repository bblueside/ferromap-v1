/**
 * lib/clustering.ts
 *
 * DBSCAN sobre coordenadas geográficas (grados). Extraído de HeatCircleMarkers
 * para aislarlo y poder testearlo. El escaneo de vecinos es O(n²) — aceptable
 * para los tamaños actuales; si crece mucho, considerar `supercluster`.
 */

export interface ClusterPoint {
    lat: number;
    lng: number;
}

export interface Cluster {
    lat: number;
    lng: number;
    count: number;
}

export function dbscan(
    points: ClusterPoint[],
    eps = 0.05,
    minPts = 2
): Cluster[] {
    const n = points.length;
    if (n === 0) return [];

    const labels = new Int32Array(n).fill(-2);
    let clusterId = 0;

    function neighbors(i: number): number[] {
        const result: number[] = [];
        const p = points[i];
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const q = points[j];
            const dlat = p.lat - q.lat;
            const dlng = p.lng - q.lng;
            if (Math.sqrt(dlat * dlat + dlng * dlng) <= eps) result.push(j);
        }
        return result;
    }

    for (let i = 0; i < n; i++) {
        if (labels[i] !== -2) continue;
        const nbrs = neighbors(i);
        if (nbrs.length < minPts - 1) {
            labels[i] = -1;
            continue;
        }
        labels[i] = clusterId;
        const queue = [...nbrs];
        while (queue.length > 0) {
            const j = queue.pop()!;
            if (labels[j] === -1) {
                labels[j] = clusterId;
                continue;
            }
            if (labels[j] !== -2) continue;
            labels[j] = clusterId;
            const jNbrs = neighbors(j);
            if (jNbrs.length >= minPts - 1) queue.push(...jNbrs);
        }
        clusterId++;
    }

    if (clusterId === 0) {
        labels.fill(0);
        clusterId = 1;
    }

    // Reasigna el ruido (-1) al cluster más cercano.
    for (let i = 0; i < n; i++) {
        if (labels[i] !== -1) continue;
        let bestCluster = 0;
        let bestDist = Infinity;
        const p = points[i];
        for (let j = 0; j < n; j++) {
            if (labels[j] < 0) continue;
            const q = points[j];
            const d = Math.sqrt((p.lat - q.lat) ** 2 + (p.lng - q.lng) ** 2);
            if (d < bestDist) {
                bestDist = d;
                bestCluster = labels[j];
            }
        }
        labels[i] = bestCluster;
    }

    const accLat: number[] = Array(clusterId).fill(0);
    const accLng: number[] = Array(clusterId).fill(0);
    const counts: number[] = Array(clusterId).fill(0);
    for (let i = 0; i < n; i++) {
        const c = labels[i];
        accLat[c] += points[i].lat;
        accLng[c] += points[i].lng;
        counts[c]++;
    }

    return Array.from({ length: clusterId }, (_, c) => ({
        lat: accLat[c] / counts[c],
        lng: accLng[c] / counts[c],
        count: counts[c],
    }));
}
