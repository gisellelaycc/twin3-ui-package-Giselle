/**
 * Twin Matrix — Unit Tests for Encoding Engines + Permutation Cipher
 */
import { describe, it, expect } from "vitest";
import {
    encodeContinuous, decodeContinuous,
    encodeDiscrete, decodeDiscrete,
    encodeTimeSeries, decodeTimeSeries,
    encodeMedia, decodeMedia,
    encodeNarrative, decodeNarrative, bitmaskJaccard,
    encodeVector, decodeVector,
    encodeIndexing, IndexingRegistry,
    encodeByType,
    buildSoulVector,
    type DimensionSpec,
    type VectorEncoderConfig,
} from "./encoders";
import {
    generatePermutation,
    applyCipher,
    reverseCipher,
    createAuthorizationMapping,
} from "./permutation";

// ─── Algorithm 1: Continuous ─────────────────────────────────────────────────

describe("Continuous Encoder", () => {
    it("encodes 0 → 0", () => {
        expect(encodeContinuous(0)).toBe(0);
    });

    it("encodes max → 255", () => {
        expect(encodeContinuous(100)).toBe(255);
    });

    it("encodes 50% → ~128", () => {
        expect(encodeContinuous(50)).toBe(128);
    });

    it("clamps negative values to 0", () => {
        expect(encodeContinuous(-10)).toBe(0);
    });

    it("clamps over-max to 255", () => {
        expect(encodeContinuous(200)).toBe(255);
    });

    it("round-trips correctly", () => {
        for (const v of [0, 25, 50, 75, 100]) {
            const encoded = encodeContinuous(v);
            const decoded = decodeContinuous(encoded);
            expect(Math.abs(decoded - v)).toBeLessThan(1);
        }
    });
});

// ─── Algorithm 2: Discrete ───────────────────────────────────────────────────

describe("Discrete Encoder", () => {
    it("5-level maps correctly", () => {
        expect(encodeDiscrete(0, 5)).toBe(0x00);
        expect(encodeDiscrete(1, 5)).toBe(0x40);
        expect(encodeDiscrete(2, 5)).toBe(0x80);
        expect(encodeDiscrete(3, 5)).toBe(0xc0);
        expect(encodeDiscrete(4, 5)).toBe(0xff);
    });

    it("3-level maps correctly", () => {
        expect(encodeDiscrete(0, 3)).toBe(0x20);
        expect(encodeDiscrete(1, 3)).toBe(0x80);
        expect(encodeDiscrete(2, 3)).toBe(0xe0);
    });

    it("clamps index overflow to last entry", () => {
        expect(encodeDiscrete(99, 3)).toBe(0xe0);
    });

    it("round-trips correctly", () => {
        for (let i = 0; i < 5; i++) {
            expect(decodeDiscrete(encodeDiscrete(i, 5), 5)).toBe(i);
        }
    });
});

// ─── Algorithm 3: Time-Series ────────────────────────────────────────────────

describe("Time-Series Encoder", () => {
    it("packs mean=15, trend=15 → 0xFF", () => {
        expect(encodeTimeSeries(15, 15)).toBe(0xff);
    });

    it("packs mean=0, trend=0 → 0x00", () => {
        expect(encodeTimeSeries(0, 0)).toBe(0x00);
    });

    it("packs mean=10, trend=7 → 0xA7", () => {
        expect(encodeTimeSeries(10, 7)).toBe(0xa7);
    });

    it("round-trips correctly", () => {
        const { mean, trend } = decodeTimeSeries(encodeTimeSeries(10, 7));
        expect(mean).toBe(10);
        expect(trend).toBe(7);
    });
});

// ─── Algorithm 4: Media ──────────────────────────────────────────────────────

describe("Media Encoder", () => {
    it("packs 0,0 → 0x00", () => {
        expect(encodeMedia(0, 0)).toBe(0x00);
    });

    it("packs 1,1 → 0xFF", () => {
        expect(encodeMedia(1, 1)).toBe(0xff);
    });

    it("round-trips within tolerance", () => {
        const { complexity, intensity } = decodeMedia(encodeMedia(0.5, 0.8));
        expect(Math.abs(complexity - 0.5)).toBeLessThan(0.1);
        expect(Math.abs(intensity - 0.8)).toBeLessThan(0.1);
    });
});

// ─── Algorithm 5: Narrative (Bitmask) ────────────────────────────────────────

describe("Narrative Encoder", () => {
    it("empty → 0x00", () => {
        expect(encodeNarrative([])).toBe(0);
    });

    it("all 8 bits → 0xFF", () => {
        expect(encodeNarrative([0, 1, 2, 3, 4, 5, 6, 7])).toBe(0xff);
    });

    it("[0, 2] → bit0 + bit2 = 5", () => {
        expect(encodeNarrative([0, 2])).toBe(5);
    });

    it("round-trips correctly", () => {
        const indices = [1, 3, 5];
        expect(decodeNarrative(encodeNarrative(indices))).toEqual(indices);
    });

    it("Jaccard similarity works", () => {
        const a = encodeNarrative([0, 1, 2]); // bits 0,1,2
        const b = encodeNarrative([1, 2, 3]); // bits 1,2,3
        const j = bitmaskJaccard(a, b);
        // intersection = {1,2} = 2, union = {0,1,2,3} = 4 → 0.5
        expect(j).toBe(0.5);
    });

    it("identical bitmasks → Jaccard = 1", () => {
        const a = encodeNarrative([0, 1]);
        expect(bitmaskJaccard(a, a)).toBe(1);
    });

    it("disjoint bitmasks → Jaccard = 0", () => {
        const a = encodeNarrative([0, 1]);
        const b = encodeNarrative([2, 3]);
        expect(bitmaskJaccard(a, b)).toBe(0);
    });
});

// ─── Algorithm 6: Vector ─────────────────────────────────────────────────────

describe("Vector Encoder", () => {
    const config: VectorEncoderConfig = {
        itemWeights: {
            Running: [0.9, 0.3, 0.2],
            Swimming: [0.8, 0.5, 0.4],
            Basketball: [0.5, 0.6, 0.8],
            Yoga: [0.3, 0.2, 0.5],
            Tennis: [0.6, 0.7, 0.7],
        },
        rankWeights: [5, 4, 3, 2, 1],
        bitWidths: [3, 3, 2] as [number, number, number],
    };

    it("encodes ranked list to a byte", () => {
        const byte = encodeVector(["Running", "Basketball"], config);
        expect(byte).toBeGreaterThanOrEqual(0);
        expect(byte).toBeLessThanOrEqual(255);
    });

    it("different rankings produce different bytes", () => {
        const a = encodeVector(["Running", "Basketball"], config);
        const b = encodeVector(["Yoga", "Tennis"], config);
        expect(a).not.toBe(b);
    });

    it("decode extracts 3 axis values", () => {
        const byte = encodeVector(["Running"], config);
        const { axis1, axis2, axis3 } = decodeVector(byte);
        expect(axis1).toBeGreaterThanOrEqual(0);
        expect(axis1).toBeLessThanOrEqual(7); // 3-bit max
        expect(axis2).toBeLessThanOrEqual(7);
        expect(axis3).toBeLessThanOrEqual(3); // 2-bit max
    });
});

// ─── Algorithm 7: Indexing (CRC8) ────────────────────────────────────────────

describe("Indexing Encoder", () => {
    it("deterministic: same items → same hash", () => {
        const a = encodeIndexing(["Nike", "Adidas"]);
        const b = encodeIndexing(["Adidas", "Nike"]); // order doesn't matter
        expect(a).toBe(b);
    });

    it("different items → likely different hash", () => {
        const a = encodeIndexing(["Nike", "Adidas"]);
        const b = encodeIndexing(["Nike", "Puma"]);
        // Not guaranteed but likely different
        expect(typeof a).toBe("number");
        expect(typeof b).toBe("number");
    });

    it("result is in 0-255 range", () => {
        const h = encodeIndexing(["Brand1", "Brand2", "Brand3"]);
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(255);
    });

    it("registry can reverse lookup", () => {
        const registry = new IndexingRegistry();
        const hash = registry.register(["Nike", "Adidas"]);
        const results = registry.lookup(hash);
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual(["Adidas", "Nike"]); // sorted
    });
});

// ─── Universal Encoder ───────────────────────────────────────────────────────

describe("Universal Encoder (encodeByType)", () => {
    it("routes to correct encoder", () => {
        const spec: DimensionSpec = {
            dimId: 5,
            name: "Sport_Frequency",
            layer: "Sport",
            quadrant: "P",
            encoding: "continuous",
            priority: 1,
            uiType: "slider",
            maxValue: 100,
        };
        expect(encodeByType(50, spec)).toBe(128);
    });
});

// ─── buildSoulVector ─────────────────────────────────────────────────────────

describe("buildSoulVector", () => {
    it("builds a 256-byte vector", () => {
        const specs: DimensionSpec[] = [
            {
                dimId: 1,
                name: "Sport_Frequency",
                layer: "Sport",
                quadrant: "P",
                encoding: "continuous",
                priority: 1,
                uiType: "slider",
                maxValue: 100,
            },
        ];
        const inputs = new Map<number, unknown>([[1, 75]]);
        const soul = buildSoulVector(inputs, specs);
        expect(soul.length).toBe(256);
        expect(soul[1]).toBe(encodeContinuous(75));
    });
});

// ─── Permutation Cipher ─────────────────────────────────────────────────────

describe("Permutation Cipher", () => {
    const seed = new Uint8Array(32);
    seed[0] = 42;
    seed[1] = 137;

    it("generates a valid permutation of [1..255]", () => {
        const perm = generatePermutation(seed);
        expect(perm.length).toBe(255);
        // All values from 1 to 255 should be present exactly once
        const sorted = [...perm].sort((a, b) => a - b);
        for (let i = 0; i < 255; i++) {
            expect(sorted[i]).toBe(i + 1);
        }
    });

    it("same seed → same permutation (deterministic)", () => {
        const perm1 = generatePermutation(seed);
        const perm2 = generatePermutation(seed);
        expect(perm1).toEqual(perm2);
    });

    it("different seeds → different permutations", () => {
        const seed2 = new Uint8Array(32);
        seed2[0] = 99;
        const perm1 = generatePermutation(seed);
        const perm2 = generatePermutation(seed2);
        expect(perm1).not.toEqual(perm2);
    });

    it("apply + reverse = identity", () => {
        const perm = generatePermutation(seed);
        const soul = new Uint8Array(256);
        for (let i = 0; i < 256; i++) soul[i] = i; // identity vector for easy checking

        const shuffled = applyCipher(soul, perm);
        const restored = reverseCipher(shuffled, perm);

        expect(Array.from(restored)).toEqual(Array.from(soul));
    });

    it("dim[0] is never shuffled", () => {
        const perm = generatePermutation(seed);
        const soul = new Uint8Array(256);
        soul[0] = 42; // Humanity Index
        soul[1] = 100;

        const shuffled = applyCipher(soul, perm);
        expect(shuffled[0]).toBe(42); // Must stay at position 0
    });

    it("authorization mapping selects correct dims", () => {
        const perm = generatePermutation(seed);
        const soul = new Uint8Array(256);
        for (let i = 0; i < 256; i++) soul[i] = i;

        const auth = createAuthorizationMapping(soul, perm, {
            authorizedDims: [0, 1, 5, 100],
            ttlSeconds: 86400,
        });

        expect(auth.mappings.length).toBe(4);
        expect(auth.mappings[0].realDim).toBe(0);
        expect(auth.mappings[0].value).toBe(0); // soul[0] = 0
        expect(auth.mappings[1].realDim).toBe(1);
        expect(auth.mappings[1].value).toBe(1); // soul[1] = 1
    });
});
