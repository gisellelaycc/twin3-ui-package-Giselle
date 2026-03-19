import { BaseError, ContractFunctionRevertedError, type Address, type Hex } from 'viem';

const twinMatrixSbtAddress = (import.meta.env.TWIN_MATRIX_SBT_ADDRESS ?? '').trim();

export const isContractConfigured = /^0x[a-fA-F0-9]{40}$/.test(twinMatrixSbtAddress);

export const TWIN_MATRIX_SBT_ADDRESS: Address = isContractConfigured
  ? (twinMatrixSbtAddress as Address)
  : ('0x0000000000000000000000000000000000000000' as Address);

export const twinMatrixSbtAbi = [
  { type: 'error', name: 'TokenNotFound', inputs: [] },
  { type: 'error', name: 'AlreadyMinted', inputs: [{ name: 'owner', type: 'address' }] },
  { type: 'error', name: 'NotTokenOwner', inputs: [] },
  { type: 'error', name: 'VersionOutOfRange', inputs: [] },
  { type: 'error', name: 'AgentNotBound', inputs: [] },
  { type: 'error', name: 'InvalidAgent', inputs: [] },
  { type: 'error', name: 'EmptyPermission', inputs: [] },
  { type: 'error', name: 'InvalidExpiry', inputs: [] },
  { type: 'error', name: 'PermissionExpired', inputs: [{ name: 'expiry', type: 'uint64' }] },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'updateMatrix',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'newMatrix', type: 'bytes32[8]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'tokenIdOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'latestVersion',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'getVersionCount',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getVersionMeta',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'version', type: 'uint32' },
    ],
    outputs: [
      { name: 'digest', type: 'bytes32' },
      { name: 'blockNumber', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    name: 'getMatrixAtVersion',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'version', type: 'uint32' },
    ],
    outputs: [{ type: 'bytes32[8]' }],
  },
  {
    type: 'function',
    name: 'getLatestMatrix',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'bytes32[8]' }],
  },
  {
    type: 'function',
    name: 'getBoundAgents',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'agents', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'permissionMaskOf',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'agent', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'permissionExpiryOf',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'agent', type: 'address' },
    ],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'bindAgentAndGrantPermission',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'agent', type: 'address' },
      { name: 'newMask', type: 'uint256' },
      { name: 'expiry', type: 'uint64' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setPermission',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'agent', type: 'address' },
      { name: 'newMask', type: 'uint256' },
      { name: 'expiry', type: 'uint64' },
    ],
    outputs: [],
  },
] as const;

export const erc20BalanceAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const;

export interface OnchainVersion {
  version: number;
  blockNumber: number;
  digest: Hex;
  matrix: number[];
}

export interface OnchainBoundAgent {
  name: string;
  address: Address;
  tokenId: bigint | null;
  permissionMask: bigint;
  permissionExpiry: bigint;
  usdtBalanceWei: bigint | null;
  usdtDecimals: number;
  permissionMaskBinary256: string;
  scopeGranted: number[];
  active: boolean;
}

const MASK_64 = (1n << 64n) - 1n;
const QUADRANT_MASKS = {
  Physical: MASK_64 << 0n,      // bits 0..63
  Digital: MASK_64 << 64n,      // bits 64..127
  Social: MASK_64 << 128n,      // bits 128..191
  Spiritual: MASK_64 << 192n,   // bits 192..255
} as const;

export function permissionMaskToBinary256(mask: bigint): string {
  return mask.toString(2).padStart(256, '0');
}

export function permissionMaskToGrantedScope(mask: bigint): number[] {
  const granted: number[] = [];
  for (let bit = 0; bit < 256; bit++) {
    if (((mask >> BigInt(bit)) & 1n) === 1n) granted.push(bit);
  }
  return granted;
}

export function permissionMaskToGrantedQuadrants(mask: bigint): string[] {
  const granted: string[] = [];
  if ((mask & QUADRANT_MASKS.Physical) !== 0n) granted.push('Physical');
  if ((mask & QUADRANT_MASKS.Digital) !== 0n) granted.push('Digital');
  if ((mask & QUADRANT_MASKS.Social) !== 0n) granted.push('Social');
  if ((mask & QUADRANT_MASKS.Spiritual) !== 0n) granted.push('Spiritual');
  return granted;
}

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 255) return 255;
  return Math.round(value);
}

export function encodeSignatureToMatrix(signature: number[]): [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex] {
  const normalized = Array.from({ length: 256 }, (_, i) => clampByte(signature[i] ?? 0));
  const words: Hex[] = [];

  for (let w = 0; w < 8; w++) {
    const start = w * 32;
    const bytes = normalized.slice(start, start + 32);
    const hex = `0x${bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;
    words.push(hex);
  }

  return words as [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex];
}

export function decodeMatrixToSignature(matrix: readonly Hex[]): number[] {
  const out: number[] = [];

  for (const word of matrix) {
    const raw = word.slice(2).padStart(64, '0');
    for (let i = 0; i < 64; i += 2) {
      out.push(parseInt(raw.slice(i, i + 2), 16));
    }
  }

  return out.slice(0, 256);
}

export function isTokenNotFoundError(error: unknown): boolean {
  if (error instanceof BaseError) {
    const reverted = error.walk((item) => item instanceof ContractFunctionRevertedError) as
      | ContractFunctionRevertedError
      | undefined;
    if (reverted?.data?.errorName === 'TokenNotFound') return true;
  }
  const text = String(error);
  return text.includes('TokenNotFound') || text.includes('0xcbdb7b30');
}
