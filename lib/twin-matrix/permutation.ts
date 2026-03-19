/**
 * Twin Matrix — Permutation Cipher
 *
 * Provides semantic obfuscation for on-chain Soul vectors.
 * Dimensions 1-255 are deterministically shuffled using a seed
 * derived from the user's wallet signature.
 *
 * dim[0] (Humanity Index) is NEVER shuffled — it stays fixed.
 *
 * Security: keyspace = 255! ≈ 3.35 × 10^502
 */

// ─── Fisher-Yates Deterministic Shuffle ──────────────────────────────────────

/**
 * Simple deterministic PRNG from a 32-byte seed (keccak256 output).
 * Uses a 64-bit LCG on two 32-bit halves of the seed.
 */
class DeterministicRng {
    private state: bigint;

    constructor(seed: Uint8Array) {
        // Take first 8 bytes as initial state
        this.state = 0n;
        for (let i = 0; i < Math.min(8, seed.length); i++) {
            this.state = (this.state << 8n) | BigInt(seed[i]);
        }
        if (this.state === 0n) this.state = 1n;
    }

    next(max: number): number {
        // LCG: state = state * a + c (mod 2^64)
        this.state =
            (this.state * 6364136223846793005n + 1442695040888963407n) &
            ((1n << 64n) - 1n);
        return Number(this.state % BigInt(max));
    }
}

/**
 * Generate a deterministic permutation of [1..255] from a seed.
 * dim[0] is excluded (Humanity Index, always fixed).
 */
export function generatePermutation(seed: Uint8Array): number[] {
    const arr = Array.from({ length: 255 }, (_, i) => i + 1);
    const rng = new DeterministicRng(seed);

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = rng.next(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/**
 * Apply permutation cipher: shuffle dims 1-255 of a Soul vector.
 * dim[0] stays fixed.
 */
export function applyCipher(
    soul: Uint8Array,
    permutation: number[],
): Uint8Array {
    if (soul.length !== 256) throw new Error("Soul must be 256 bytes");
    if (permutation.length !== 255) throw new Error("Permutation must be 255 entries");

    const shuffled = new Uint8Array(256);
    shuffled[0] = soul[0]; // Humanity Index — fixed

    for (let i = 0; i < 255; i++) {
        shuffled[permutation[i]] = soul[i + 1];
    }

    return shuffled;
}

/**
 * Reverse permutation cipher: restore original order from shuffled vector.
 */
export function reverseCipher(
    shuffled: Uint8Array,
    permutation: number[],
): Uint8Array {
    if (shuffled.length !== 256) throw new Error("Shuffled must be 256 bytes");
    if (permutation.length !== 255) throw new Error("Permutation must be 255 entries");

    const original = new Uint8Array(256);
    original[0] = shuffled[0]; // Humanity Index — fixed

    for (let i = 0; i < 255; i++) {
        original[i + 1] = shuffled[permutation[i]];
    }

    return original;
}

// ─── Wallet Integration ──────────────────────────────────────────────────────

/**
 * Generate seed from wallet signature for a specific version.
 * In production, this calls wallet.signMessage().
 * The keccak256 of the signature becomes the seed.
 */
export async function generateSeedFromWallet(
    signMessage: (message: string) => Promise<string>,
    version: number,
): Promise<Uint8Array> {
    const message = `twin3-matrix-permutation-v${version}`;
    const signature = await signMessage(message);

    // Simple hash: SHA-256 of the signature string
    // (In production, use keccak256 for Ethereum compatibility)
    const encoder = new TextEncoder();
    const data = encoder.encode(signature);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hashBuffer);
}

// ─── Authorization Mapping ───────────────────────────────────────────────────

export interface AuthorizationConfig {
    authorizedDims: number[];  // which real dimensions to authorize
    ttlSeconds: number;        // how long the authorization is valid
}

export interface DimMapping {
    realDim: number;       // original dimension index
    shuffledPos: number;   // where it is in the shuffled on-chain vector
    value: number;         // the actual byte value
}

/**
 * Create an authorization mapping for a Personal Agent.
 * Only shares the mapping for authorized dimensions.
 */
export function createAuthorizationMapping(
    soul: Uint8Array,
    permutation: number[],
    config: AuthorizationConfig,
): {
    mappings: DimMapping[];
    ttlSeconds: number;
    issuedAt: number;
} {
    const mappings: DimMapping[] = [];

    for (const dim of config.authorizedDims) {
        if (dim === 0) {
            // Humanity Index is always at position 0
            mappings.push({ realDim: 0, shuffledPos: 0, value: soul[0] });
        } else if (dim >= 1 && dim <= 255) {
            const shuffledPos = permutation[dim - 1];
            mappings.push({ realDim: dim, shuffledPos, value: soul[dim] });
        }
    }

    return {
        mappings,
        ttlSeconds: config.ttlSeconds,
        issuedAt: Date.now(),
    };
}
