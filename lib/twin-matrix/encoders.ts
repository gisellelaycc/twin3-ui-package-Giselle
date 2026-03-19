/**
 * Twin Matrix — 7 Encoding Engines
 *
 * Compresses behavioral attributes into single bytes (0-255)
 * using seven specialized encoding algorithms.
 *
 * All encoding runs on the user's device. Raw data never leaves the frontend.
 */

// ─── Algorithm 1: Continuous Encoder ─────────────────────────────────────────
// For attributes with linear intensity scales (frequency, duration, percentage)
// Properties: Monotonic, distance-preserving. Supports Euclidean distance.

export function encodeContinuous(value: number, maxVal: number = 100): number {
    const normalized = Math.min(Math.max(value / maxVal, 0), 1);
    return Math.round(normalized * 255);
}

export function decodeContinuous(byte: number, maxVal: number = 100): number {
    return (byte / 255) * maxVal;
}

// ─── Algorithm 2: Discrete Encoder (LUT) ─────────────────────────────────────
// For mutually exclusive categories. Values spaced to maximize separation.
// Properties: Non-ordinal. No meaningful distance between values.

const DISCRETE_LUTS: Record<string, number[]> = {
    "3-level": [0x20, 0x80, 0xe0],
    "4-level": [0x00, 0x55, 0xaa, 0xff],
    "5-level": [0x00, 0x40, 0x80, 0xc0, 0xff],
    "6-level": [0x00, 0x33, 0x66, 0x99, 0xcc, 0xff],
    "7-level": [0x00, 0x2a, 0x55, 0x80, 0xaa, 0xd5, 0xff],
    "8-level": [0x00, 0x24, 0x49, 0x6d, 0x92, 0xb6, 0xdb, 0xff],
};

export function encodeDiscrete(index: number, levels: number = 5): number {
    const key = `${levels}-level`;
    const lut = DISCRETE_LUTS[key];
    if (!lut) throw new Error(`No LUT for ${levels} levels`);
    return lut[Math.min(index, lut.length - 1)];
}

export function decodeDiscrete(byte: number, levels: number = 5): number {
    const key = `${levels}-level`;
    const lut = DISCRETE_LUTS[key];
    if (!lut) throw new Error(`No LUT for ${levels} levels`);
    // Find nearest LUT entry
    let nearest = 0;
    let minDist = Math.abs(byte - lut[0]);
    for (let i = 1; i < lut.length; i++) {
        const dist = Math.abs(byte - lut[i]);
        if (dist < minDist) {
            minDist = dist;
            nearest = i;
        }
    }
    return nearest;
}

// ─── Algorithm 3: Time-Series Encoder ────────────────────────────────────────
// Packs two 4-bit features: mean level (high nibble) and trend (low nibble).
// mean: 0-15 (0=none, 15=max), trend: 0=declining, 7=stable, 15=rising

export function encodeTimeSeries(meanLevel: number, trend: number): number {
    const m4 = Math.min(Math.max(Math.round(meanLevel), 0), 15);
    const t4 = Math.min(Math.max(Math.round(trend), 0), 15);
    return (m4 << 4) | t4;
}

export function decodeTimeSeries(byte: number): { mean: number; trend: number } {
    return {
        mean: (byte >> 4) & 0x0f,
        trend: byte & 0x0f,
    };
}

// ─── Algorithm 4: Media Encoder ──────────────────────────────────────────────
// Packs complexity (high nibble) and intensity (low nibble) as two 4-bit values.
// For emotional/aesthetic dimensions derived from media analysis.

export function encodeMedia(complexity: number, intensity: number): number {
    const c4 = Math.round(Math.min(Math.max(complexity, 0), 1) * 15);
    const i4 = Math.round(Math.min(Math.max(intensity, 0), 1) * 15);
    return (c4 << 4) | i4;
}

export function decodeMedia(byte: number): { complexity: number; intensity: number } {
    return {
        complexity: ((byte >> 4) & 0x0f) / 15,
        intensity: (byte & 0x0f) / 15,
    };
}

// ─── Algorithm 5: Narrative Encoder (Bitmask) ────────────────────────────────
// Each selected item sets a bit flag. Supports up to 8 concurrent selections.
// Matching uses Jaccard similarity or must-include-bit filters.

export function encodeNarrative(selectedIndices: number[]): number {
    let mask = 0;
    for (const i of selectedIndices) {
        if (i >= 0 && i < 8) {
            mask |= 1 << i;
        }
    }
    return mask & 0xff;
}

export function decodeNarrative(byte: number): number[] {
    const indices: number[] = [];
    for (let i = 0; i < 8; i++) {
        if (byte & (1 << i)) {
            indices.push(i);
        }
    }
    return indices;
}

// Jaccard similarity for bitmask matching
export function bitmaskJaccard(a: number, b: number): number {
    const intersection = popCount(a & b);
    const union = popCount(a | b);
    return union === 0 ? 0 : intersection / union;
}

function popCount(n: number): number {
    let count = 0;
    let v = n;
    while (v) {
        count += v & 1;
        v >>= 1;
    }
    return count;
}

// ─── Algorithm 6: Vector Encoder (Dimensional Projection) ────────────────────
// Reduces N-dimensional taste to a single byte via weighted axis packing.
// Default: 3-3-2 bit packing for 3 axes.

export type AxisWeights = [number, number, number]; // [primary, secondary, tertiary]

export interface VectorEncoderConfig {
    itemWeights: Record<string, AxisWeights>;
    rankWeights?: number[]; // e.g. [5, 4, 3, 2, 1] for top-5
    bitWidths?: [number, number, number]; // default [3, 3, 2]
}

export function encodeVector(
    rankedItems: string[],
    config: VectorEncoderConfig,
): number {
    const rankWeights = config.rankWeights || [5, 4, 3, 2, 1];
    const bitWidths = config.bitWidths || [3, 3, 2];

    let a1 = 0, a2 = 0, a3 = 0;
    let maxA1 = 0, maxA2 = 0, maxA3 = 0;

    for (let i = 0; i < Math.min(rankedItems.length, rankWeights.length); i++) {
        const weights = config.itemWeights[rankedItems[i]];
        if (!weights) continue;
        const rw = rankWeights[i];
        a1 += weights[0] * rw;
        a2 += weights[1] * rw;
        a3 += weights[2] * rw;
        maxA1 += 1.0 * rw; // max possible weight per axis
        maxA2 += 1.0 * rw;
        maxA3 += 1.0 * rw;
    }

    // Normalize to bit-width ranges
    const maxVal1 = (1 << bitWidths[0]) - 1;
    const maxVal2 = (1 << bitWidths[1]) - 1;
    const maxVal3 = (1 << bitWidths[2]) - 1;

    const v1 = maxA1 > 0 ? Math.round((a1 / maxA1) * maxVal1) : 0;
    const v2 = maxA2 > 0 ? Math.round((a2 / maxA2) * maxVal2) : 0;
    const v3 = maxA3 > 0 ? Math.round((a3 / maxA3) * maxVal3) : 0;

    const shift2 = bitWidths[2];
    const shift1 = bitWidths[1] + shift2;

    return (v1 << shift1) | (v2 << shift2) | v3;
}

export function decodeVector(
    byte: number,
    bitWidths: [number, number, number] = [3, 3, 2],
): { axis1: number; axis2: number; axis3: number } {
    const mask3 = (1 << bitWidths[2]) - 1;
    const mask2 = (1 << bitWidths[1]) - 1;
    const mask1 = (1 << bitWidths[0]) - 1;

    const shift2 = bitWidths[2];
    const shift1 = bitWidths[1] + shift2;

    return {
        axis1: (byte >> shift1) & mask1,
        axis2: (byte >> shift2) & mask2,
        axis3: byte & mask3,
    };
}

// ─── Algorithm 7: Indexing Encoder (CRC8 Combo Hash) ─────────────────────────
// For unordered multi-selections (brand affinities).
// Deterministic: same selection → same hash. No distance metric between hashes.

// CRC-8 implementation (polynomial 0x07, init 0x00)
function crc8(data: Uint8Array): number {
    let crc = 0x00;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if (crc & 0x80) {
                crc = ((crc << 1) ^ 0x07) & 0xff;
            } else {
                crc = (crc << 1) & 0xff;
            }
        }
    }
    return crc;
}

export function encodeIndexing(selectedItems: string[]): number {
    const sorted = [...selectedItems].sort();
    const key = sorted.join(",");
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    return crc8(data);
}

// Reverse lookup: maintain a hash → items mapping for matching
export class IndexingRegistry {
    private hashToItems = new Map<number, string[][]>();

    register(items: string[]): number {
        const hash = encodeIndexing(items);
        const sorted = [...items].sort();
        const existing = this.hashToItems.get(hash) || [];
        // Avoid duplicate registrations
        const alreadyExists = existing.some(
            (e) => e.length === sorted.length && e.every((v, i) => v === sorted[i]),
        );
        if (!alreadyExists) {
            existing.push(sorted);
            this.hashToItems.set(hash, existing);
        }
        return hash;
    }

    lookup(hash: number): string[][] {
        return this.hashToItems.get(hash) || [];
    }

    // Check if two hashes share items (for partial matching)
    hasOverlap(hashA: number, hashB: number): boolean {
        const itemsA = this.lookup(hashA);
        const itemsB = this.lookup(hashB);
        if (itemsA.length === 0 || itemsB.length === 0) return hashA === hashB;

        for (const a of itemsA) {
            for (const b of itemsB) {
                if (a.some((item) => b.includes(item))) return true;
            }
        }
        return false;
    }
}

// ─── Dimension Specification ─────────────────────────────────────────────────

export type EncodingType =
    | "continuous"
    | "discrete"
    | "time-series"
    | "media"
    | "narrative"
    | "vector"
    | "indexing";

export interface DimensionSpec {
    dimId: number;
    name: string;
    layer: string; // Sport, Music, Art, etc.
    quadrant: "P" | "D" | "M" | "S"; // Physical, Digital, Mental, Social
    encoding: EncodingType;
    priority: number; // P1-P20, lower = higher commercial value
    uiType: "slider" | "single-select" | "multi-select" | "ranked-list";
    options?: string[];       // for discrete/narrative/indexing
    maxValue?: number;        // for continuous
    levels?: number;          // for discrete
    axisConfig?: VectorEncoderConfig; // for vector
}

// ─── Universal Encoder ───────────────────────────────────────────────────────

export function encodeByType(
    value: unknown,
    spec: DimensionSpec,
): number {
    switch (spec.encoding) {
        case "continuous":
            return encodeContinuous(value as number, spec.maxValue || 100);

        case "discrete":
            return encodeDiscrete(value as number, spec.levels || 5);

        case "time-series": {
            const ts = value as { mean: number; trend: number };
            return encodeTimeSeries(ts.mean, ts.trend);
        }

        case "media": {
            const m = value as { complexity: number; intensity: number };
            return encodeMedia(m.complexity, m.intensity);
        }

        case "narrative":
            return encodeNarrative(value as number[]);

        case "vector":
            if (!spec.axisConfig) throw new Error(`Vector spec ${spec.name} missing axisConfig`);
            return encodeVector(value as string[], spec.axisConfig);

        case "indexing":
            return encodeIndexing(value as string[]);

        default:
            throw new Error(`Unknown encoding type: ${spec.encoding}`);
    }
}

// ─── Soul Vector Builder ─────────────────────────────────────────────────────

export function buildSoulVector(
    inputs: Map<number, unknown>,
    specs: DimensionSpec[],
): Uint8Array {
    const soul = new Uint8Array(256);

    for (const spec of specs) {
        const value = inputs.get(spec.dimId);
        if (value !== undefined && value !== null) {
            soul[spec.dimId] = encodeByType(value, spec);
        }
    }

    return soul;
}
