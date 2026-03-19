import type { Address, PublicClient } from 'viem';

const DATA_URI_JSON_BASE64_PREFIX = 'data:application/json;base64,';
const LOG_SCAN_BLOCK_RANGE = 9000n;
const MAX_LOG_LOOKBACK_BLOCKS = 300000n;

function parseAddress(value: string | undefined): Address | null {
  const raw = (value ?? '').trim();
  return /^0x[a-fA-F0-9]{40}$/.test(raw) ? (raw as Address) : null;
}

export const ERC8004_CONTRACT_ADDRESS = parseAddress(import.meta.env.ERC8004_CONTRACT_ADDRESS);

const identityRegistryErc8004Abi = [
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { indexed: true, name: 'agentId', type: 'uint256' },
      { indexed: false, name: 'agentURI', type: 'string' },
      { indexed: true, name: 'owner', type: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MetadataSet',
    inputs: [
      { indexed: true, name: 'agentId', type: 'uint256' },
      { indexed: true, name: 'indexedMetadataKey', type: 'string' },
      { indexed: false, name: 'metadataKey', type: 'string' },
      { indexed: false, name: 'metadataValue', type: 'bytes' },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'getAgentWallet',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
] as const;

interface Erc8004TokenMetadata {
  name?: string;
}

export interface Erc8004AgentProfile {
  tokenId: bigint;
  name: string | null;
}

function decodeBase64Utf8(base64: string): string {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return '';
}

function parseMetadataFromTokenUri(tokenUri: string): Erc8004TokenMetadata | null {
  if (!tokenUri.startsWith(DATA_URI_JSON_BASE64_PREFIX)) return null;
  const payload = tokenUri.slice(DATA_URI_JSON_BASE64_PREFIX.length);
  if (!payload) return null;

  try {
    const decoded = decodeBase64Utf8(payload);
    if (!decoded) return null;
    return JSON.parse(decoded) as Erc8004TokenMetadata;
  } catch {
    return null;
  }
}

async function findLatestRegisteredTokenIdByOwner(
  publicClient: PublicClient,
  owner: Address,
): Promise<bigint | undefined> {
  if (!ERC8004_CONTRACT_ADDRESS) return undefined;
  const latestBlock = await publicClient.getBlockNumber();
  const minBlock = latestBlock > MAX_LOG_LOOKBACK_BLOCKS ? latestBlock - MAX_LOG_LOOKBACK_BLOCKS : 0n;

  for (let toBlock = latestBlock; toBlock >= minBlock;) {
    const fromBlock = toBlock >= LOG_SCAN_BLOCK_RANGE - 1n ? toBlock - (LOG_SCAN_BLOCK_RANGE - 1n) : 0n;
    const boundedFrom = fromBlock < minBlock ? minBlock : fromBlock;

    const events = await publicClient.getContractEvents({
      address: ERC8004_CONTRACT_ADDRESS,
      abi: identityRegistryErc8004Abi,
      eventName: 'Registered',
      args: { owner },
      fromBlock: boundedFrom,
      toBlock,
    });

    if (events.length > 0) {
      const latestLog = events[events.length - 1];
      return latestLog.args.agentId;
    }

    if (boundedFrom === minBlock) break;
    toBlock = boundedFrom - 1n;
  }

  return undefined;
}

async function findLatestRegisteredTokenIdByAgentWallet(
  publicClient: PublicClient,
  agentAddress: Address,
): Promise<bigint | undefined> {
  if (!ERC8004_CONTRACT_ADDRESS) return undefined;
  const latestBlock = await publicClient.getBlockNumber();
  const minBlock = latestBlock > MAX_LOG_LOOKBACK_BLOCKS ? latestBlock - MAX_LOG_LOOKBACK_BLOCKS : 0n;
  const normalizedAgentAddress = agentAddress.toLowerCase();

  for (let toBlock = latestBlock; toBlock >= minBlock;) {
    const fromBlock = toBlock >= LOG_SCAN_BLOCK_RANGE - 1n ? toBlock - (LOG_SCAN_BLOCK_RANGE - 1n) : 0n;
    const boundedFrom = fromBlock < minBlock ? minBlock : fromBlock;

    const events = await publicClient.getContractEvents({
      address: ERC8004_CONTRACT_ADDRESS,
      abi: identityRegistryErc8004Abi,
      eventName: 'Registered',
      fromBlock: boundedFrom,
      toBlock,
    });

    for (let i = events.length - 1; i >= 0; i--) {
      const candidateId = events[i].args.agentId;
      if (candidateId === undefined) continue;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wallet = await (publicClient.readContract as any)({
          address: ERC8004_CONTRACT_ADDRESS,
          abi: identityRegistryErc8004Abi,
          functionName: 'getAgentWallet',
          args: [candidateId],
        });
        if (wallet.toLowerCase() === normalizedAgentAddress) {
          return candidateId;
        }
      } catch {
        continue;
      }
    }

    if (boundedFrom === minBlock) break;
    toBlock = boundedFrom - 1n;
  }

  return undefined;
}

export async function resolveAgentProfileFromErc8004(
  publicClient: PublicClient,
  agentAddress: Address,
): Promise<Erc8004AgentProfile | null> {
  if (!ERC8004_CONTRACT_ADDRESS) return null;

  try {
    let tokenId = await findLatestRegisteredTokenIdByOwner(publicClient, agentAddress);
    if (tokenId === undefined) tokenId = await findLatestRegisteredTokenIdByAgentWallet(publicClient, agentAddress);

    if (tokenId === undefined) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenUri = await (publicClient.readContract as any)({
      address: ERC8004_CONTRACT_ADDRESS,
      abi: identityRegistryErc8004Abi,
      functionName: 'tokenURI',
      args: [tokenId],
    });

    const metadata = parseMetadataFromTokenUri(tokenUri);
    const name = metadata?.name?.trim() || null;

    return {
      tokenId,
      name,
    };
  } catch {
    return null;
  }
}
