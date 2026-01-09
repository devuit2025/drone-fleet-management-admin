import type { Feature, FeatureCollection, Polygon } from 'geojson';
import * as turf from '@turf/turf';

export function wktFromPoint(lon: number, lat: number): string {
    return `POINT(${lon} ${lat})`;
}

export function pointFromWkt(wkt: string): [number, number] | null {
    const match = wkt.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
    if (!match) return null;
    return [Number(match[1]), Number(match[2])];
}

export function closeRingIfNeeded(ring: number[][]): number[][] {
    if (ring.length === 0) return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) return ring;
    return [...ring, [...first]];
}

export function featureCollectionFromRing(ring: number[][]): FeatureCollection<Polygon> {
    const coordinates: number[][][] = [closeRingIfNeeded(ring)];
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates },
                properties: {},
            },
        ],
    };
}

export function ringFromFeatureCollection(
    fc: FeatureCollection<Polygon> | null | undefined,
): number[][] {
    if (!fc || !fc.features || fc.features.length === 0) return [];
    const first = fc.features[0];
    const geom = first.geometry;
    if (!geom || geom.type !== 'Polygon') return [];
    return geom.coordinates[0] || [];
}

export function waypointsFromPolygon(
    fc: FeatureCollection<Polygon> | null | undefined,
    defaults?: { altitudeM?: number; speedMps?: number; action?: string },
): Array<{
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
}> {
    const ring = ringFromFeatureCollection(fc);
    if (ring.length === 0) return [];
    const effective = closeRingIfNeeded(ring);
    return effective.map(([lon, lat], idx) => ({
        seqNumber: idx,
        geoPoint: wktFromPoint(lon, lat),
        altitudeM: defaults?.altitudeM ?? 100,
        speedMps: defaults?.speedMps ?? 10,
        action: defaults?.action ?? 'Survey',
    }));
}

export function intersectsAnyPolygon(
    subject: Feature<Polygon> | FeatureCollection<Polygon>,
    zones: FeatureCollection<Polygon> | Feature<Polygon>[],
): boolean {
    const subjectFc: FeatureCollection<Polygon> =
        (subject as FeatureCollection<Polygon>).type === 'FeatureCollection'
            ? (subject as FeatureCollection<Polygon>)
            : { type: 'FeatureCollection', features: [subject as Feature<Polygon>] };

    const zoneList: Feature<Polygon>[] = Array.isArray(zones)
        ? (zones as Feature<Polygon>[])
        : (zones as FeatureCollection<Polygon>).features;

    for (const f of subjectFc.features) {
        for (const z of zoneList) {
            try {
                if (turf.booleanIntersects(f as any, z as any)) return true;
            } catch {
                // ignore bogus geometries
            }
        }
    }
    return false;
}

export function isPointInAnyPolygon(
    lon: number,
    lat: number,
    zones: FeatureCollection<Polygon> | Feature<Polygon>[] | null,
): boolean {
    if (!zones) return false;

    const point = turf.point([lon, lat]);
    const zoneList: Feature<Polygon>[] = Array.isArray(zones)
        ? (zones as Feature<Polygon>[])
        : (zones as FeatureCollection<Polygon>).features;

    for (const zone of zoneList) {
        try {
            if (turf.booleanPointInPolygon(point, zone as any)) {
                return true;
            }
        } catch {
            // ignore bogus geometries
        }
    }
    return false;
}

/**
 * Check if a point is inside any permit area
 */
export function isPointInPermitArea(
    lon: number,
    lat: number,
    permitAreas: FeatureCollection<Polygon> | Feature<Polygon>[] | null,
): boolean {
    return isPointInAnyPolygon(lon, lat, permitAreas);
}

/**
 * Calculate minimum distance from point to permit area boundary (in meters)
 * Returns null if point is outside all permit areas
 */
export function distanceToPermitBoundary(
    lon: number,
    lat: number,
    permitAreas: FeatureCollection<Polygon> | Feature<Polygon>[] | null,
): number | null {
    if (!permitAreas) return null;

    const point = turf.point([lon, lat]);
    const permitList: Feature<Polygon>[] = Array.isArray(permitAreas)
        ? (permitAreas as Feature<Polygon>[])
        : (permitAreas as FeatureCollection<Polygon>).features;

    let minDistance: number | null = null;

    for (const permit of permitList) {
        try {
            // Check if point is inside permit area
            if (turf.booleanPointInPolygon(point, permit as any)) {
                // Point is inside, calculate distance to boundary
                const boundary = turf.polygonToLine(permit as any);
                const distance = turf.pointToLineDistance(point, boundary as any, {
                    units: 'meters',
                });
                if (minDistance === null || distance < minDistance) {
                    minDistance = distance;
                }
            }
        } catch {
            // ignore bogus geometries
        }
    }

    return minDistance;
}

/**
 * Check if a point is too close to permit area boundary (within buffer zone)
 * @param bufferMeters - Buffer distance in meters (default: 50m)
 */
export function isPointNearPermitBoundary(
    lon: number,
    lat: number,
    permitAreas: FeatureCollection<Polygon> | Feature<Polygon>[] | null,
    bufferMeters: number = 50,
): boolean {
    const distance = distanceToPermitBoundary(lon, lat, permitAreas);
    if (distance === null) return false;
    return distance < bufferMeters;
}
