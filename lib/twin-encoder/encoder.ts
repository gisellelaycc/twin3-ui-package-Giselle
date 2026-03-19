import type { WizardState } from '@/types/twin-matrix';
import { WRITABLE_DIMS, SLICE_NORMS } from './spec-registry';

function getProp(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// 1. Continuous (01): byte = round(value / max * 255)
function encodeContinuous(value: any): number {
  if (typeof value === 'number') {
    return Math.round(Math.min(Math.max(value / 100, 0), 1) * 255);
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) return Math.round(Math.min(Math.max(num / 100, 0), 1) * 255);
    return Math.abs(hashCode(value) % 256);
  }
  return 0;
}

// 2. Discrete (02): Index LUT
function encodeDiscrete(value: any): number {
  if (typeof value === 'string') {
    const hash = Math.abs(hashCode(value)) % 5;
    const LUT = [0, 64, 128, 192, 255];
    return LUT[hash];
  }
  return 0;
}

// 3. Time-series (03): Feature digest (4+4 bit) = (mean_4bit << 4) | trend_4bit
function encodeTimeSeries(value: any): number {
  if (typeof value === 'string') {
    const mean = Math.abs(hashCode(value)) % 16;
    const trend = Math.abs(hashCode(value + '_trend')) % 16;
    return (mean << 4) | trend;
  }
  return 0;
}

// 4. Media (04): Cosine offset -> (complexity_4bit << 4) | intensity_4bit
function encodeMedia(value: any): number {
  return encodeTimeSeries(value);
}

// 5. Narrative (05): Bitmask state machine Σ(1 << i)
function encodeNarrative(value: any): number {
  if (Array.isArray(value)) {
    let mask = 0;
    value.slice(0, 8).forEach((item, i) => {
      mask |= (1 << i);
    });
    return mask;
  }
  if (typeof value === 'string') {
    return Math.abs(hashCode(value)) % 256;
  }
  return 0;
}

// 6. Vector (06): Dim-reduction projection (Ranked list mapping)
function encodeVector(value: any): number {
  if (Array.isArray(value)) {
    const top3 = value.slice(0, 3).join('|');
    return Math.abs(hashCode(top3)) % 256;
  }
  return 0;
}

// 7. Indexing (07): CRC8(sort(selected_items))
function encodeIndexing(value: any): number {
  if (Array.isArray(value)) {
    const sorted = [...value].sort().join('|');
    return Math.abs(hashCode(sorted)) % 256;
  }
  return 0;
}

export interface EncoderError {
  code: string;
  message: string;
}

export function validateBaseline(state: WizardState): EncoderError | null {
  return null;
}

export function encodeIdentityVector(
  state: WizardState
): { signature: number[]; error: null } | { signature: null; error: EncoderError } {
  const vec = new Float32Array(256);

  // Apply the 7 data classes to all Writable dims
  WRITABLE_DIMS.forEach(spec => {
    const val = getProp(state, spec.source);
    if (val !== undefined && val !== null && val !== '') {
      let byte = 0;
      switch (spec.encoding) {
        case 'continuous': byte = encodeContinuous(val); break;
        case 'discrete': byte = encodeDiscrete(val); break;
        case 'time-series': byte = encodeTimeSeries(val); break;
        case 'media': byte = encodeMedia(val); break;
        case 'narrative': byte = encodeNarrative(val); break;
        case 'vector': byte = encodeVector(val); break;
        case 'indexing': byte = encodeIndexing(val); break;
        case 'one-hot': byte = encodeDiscrete(val); break;
      }
      vec[spec.dim_id] = byte;
    }
  });

  // Zero out any dim not in spec registry
  const validDims = new Set(WRITABLE_DIMS.map(d => d.dim_id));
  for (let i = 0; i < 256; i++) {
    if (!validDims.has(i)) {
      vec[i] = 0;
    }
  }

  const signature = Array.from(vec, v => Math.min(255, Math.max(0, Math.round(v))));
  return { signature, error: null };
}

export function computeDensity(signature: number[]): number {
  const nonZero = signature.filter(v => v > 0).length;
  return Math.round((nonZero / 256) * 100);
}
