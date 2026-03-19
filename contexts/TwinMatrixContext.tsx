import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BaseError } from 'viem';
import { toast } from 'sonner';
import { useAccount, useChainId, useDisconnect, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { WizardState } from '@/types/twin-matrix';
import { validateBaseline } from '@/lib/twin-encoder';
import {
  decodeMatrixToSignature,
  erc20BalanceAbi,
  encodeSignatureToMatrix,
  isContractConfigured,
  isTokenNotFoundError,
  permissionMaskToBinary256,
  permissionMaskToGrantedScope,
  TWIN_MATRIX_SBT_ADDRESS,
  twinMatrixSbtAbi,
  type OnchainBoundAgent,
  type OnchainVersion,
} from '@/lib/contracts/twin-matrix-sbt';
import { resolveAgentProfileFromErc8004 } from '@/lib/contracts/identity-registry-erc8004';
import { BSC_TESTNET_CHAIN_ID } from '@/lib/wallet/config';
import { useI18n } from '@/lib/i18n';

type TxAction = 'mint' | 'update' | null;

const EMPTY_SIGNATURE = Array.from({ length: 256 }, () => 0);
const usdtContractAddress = (import.meta.env.USDT_CONTRACT_ADDRESS ?? '').trim();
const hasValidUsdtAddress = /^0x[a-fA-F0-9]{40}$/.test(usdtContractAddress);

/** Mock mode — set VITE_MOCK_MODE=true in .env to bypass all chain interactions */
/** Toggle to `false` when ready to use real chain interactions */
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

const MOCK_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`;
const MOCK_WALLET_DISPLAY = '0x1234…5678';
const MOCK_TOKEN_ID = 42n;

function generateMockMatrix(): number[] {
  return Array.from({ length: 256 }, (_, i) => {
    // Create a realistic-looking distribution
    const quadrant = Math.floor(i / 64);
    const base = [60, 40, 30, 50][quadrant];
    const noise = Math.floor(Math.random() * 80);
    return Math.min(255, Math.max(0, base + noise));
  });
}

const MOCK_VERSIONS: OnchainVersion[] = [
  {
    version: 2,
    blockNumber: 48291034,
    digest: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456',
    matrix: generateMockMatrix(),
  },
  {
    version: 1,
    blockNumber: 47102983,
    digest: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    matrix: generateMockMatrix(),
  },
];

const MOCK_BOUND_AGENTS: OnchainBoundAgent[] = [
  {
    name: 'Brand Tracker Alpha',
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    tokenId: 7n,
    permissionMask: (1n << 64n) - 1n, // Physical quadrant
    permissionExpiry: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 3600),
    usdtBalanceWei: 150000000000000000000n,
    usdtDecimals: 18,
    permissionMaskBinary256: '1'.repeat(64) + '0'.repeat(192),
    scopeGranted: [0, 1, 2, 3], // Physical quadrant indices
    active: true,
  },
];

const initialState: WizardState = {
  step: 0,
  profile: { username: '', heightBin: '', weightBin: '', ageBin: '', gender: '', education: '', income: '', maritalStatus: '', occupation: '', livingType: '' },
  activeModules: [],
  sportSetup: { topSportTypes: [], favoriteBrands: [], monthlySpending: '', sportswearStyle: [], exerciseFrequency: '', avgSessionDuration: '', competitiveDrive: 50, wearableTechUsage: '' },
  sportTwin: { dietaryDiscipline: 50, recoveryMethod: [], workoutEnvironment: '', mediaConsumption: '', teamVsSolo: 50, painTolerance: 50, adrenalineSeeking: 50, explorationDesire: 50, aestheticsVsPerf: 50 },
  musicSetup: { topGenres: [], emotionalResonance: 50, listeningFidelity: '', livePerformanceBias: 50, lyricsVsInstrumental: 50, rhythmFrequency: 50, vibeConsistency: 50, complexityVsSimplicity: 50, productionEraBias: '' },
  artSetup: { coreAestheticStyle: [], favoriteArtists: [], artSpending: '', colorPalettePref: '', abstractTolerance: 50, digitalNftAcceptance: 50, creationFrequency: '' },
  readingSetup: { topFictionGenres: [], infoDietSource: [], attentionSpan: 50, criticalThinking: 50, echoChamberAvoidance: 50 },
  foodSetup: { topCuisines: [], dietaryRestrictions: [], healthVsPleasure: 50, eatingAdventure: 50, mealRoutineRegularity: '', texturePreference: [] },
  travelSetup: { topTravelStyles: [], luxuryVsBudget: 50, chaosTolerance: 50, accommodationPref: [], safetyVsRisk: 50 },
  financeSetup: { riskTolerance: 50, assetAllocation: [], cryptoAdoption: 50, tradingFrequency: '', fomoSusceptibility: 50 },
  gamingSetup: { topGenres: [], microtransactionSpend: '', difficultyPreference: 50, minMaxingTendency: 50, tiltSusceptibility: 50 },
  learningSetup: { aiTutorReliance: 50, noteTakingSystem: 50, authorityTrust: 50, structuredVsUnstructured: 50, imposterSyndrome: 50 },
  soul: {
    bars: [
      { id: 'BAR_OUTCOME_EXPERIENCE', label: 'soul.bar.performanceOrientation', left: 'soul.bar.performanceLeft', right: 'soul.bar.performanceRight', value: null },
      { id: 'BAR_CONTROL_RELEASE', label: 'soul.bar.structurePreference', left: 'soul.bar.structureLeft', right: 'soul.bar.structureRight', value: null },
      { id: 'BAR_SOLO_GROUP', label: 'soul.bar.socialPreference', left: 'soul.bar.socialLeft', right: 'soul.bar.socialRight', value: null },
      { id: 'BAR_PASSIVE_ACTIVE', label: 'soul.bar.engagementMode', left: 'soul.bar.engagementLeft', right: 'soul.bar.engagementRight', value: null },
    ],
    confirmed: false,
  },
  signature: [],
  agentSetup: {
    agent: { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search' },
    permission: { identityScope: 'Physical', tradingAuthority: 'Manual Only', authorizationDuration: '', customDurationDays: '', maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false },
  },
};

interface TwinMatrixContextValue {
  // Wallet
  address: `0x${string}` | undefined;
  isConnected: boolean;
  walletAddress: string | undefined;
  isWrongNetwork: boolean;
  openConnectModal: (() => void) | undefined;
  disconnect: () => void;
  switchToBscTestnet: () => void;
  isSwitchingNetwork: boolean;

  // Contract state
  isContractConfigured: boolean;
  isCheckingToken: boolean;
  contractError: string | null;
  tokenId: bigint | null;
  hasMintedSbt: boolean;
  latestVersion: number;
  versions: OnchainVersion[];
  boundAgents: OnchainBoundAgent[];
  refreshOnchainState: () => Promise<void>;

  // Wizard state
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  next: () => void;
  handleGenerateComplete: (sig: number[]) => void;

  // Tx actions
  txAction: TxAction;
  handleMintSbt: () => Promise<void>;
  handleUpdateMatrix: () => Promise<void>;

  // UI state
  needsMatrixUpdate: boolean;
  setNeedsMatrixUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  showAgentNudge: boolean;
  setShowAgentNudge: React.Dispatch<React.SetStateAction<boolean>>;
}

const TwinMatrixContext = createContext<TwinMatrixContextValue | null>(null);

export const useTwinMatrix = () => {
  const ctx = useContext(TwinMatrixContext);
  if (!ctx) throw new Error('useTwinMatrix must be used within TwinMatrixProvider');
  return ctx;
};

// ─── Mock Provider ───────────────────────────────────────────────
const MockTwinMatrixProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [state, setState] = useState<WizardState>(initialState);
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [mockHasMinted, setMockHasMinted] = useState(false);
  const [needsMatrixUpdate, setNeedsMatrixUpdate] = useState(false);
  const [showAgentNudge, setShowAgentNudge] = useState(false);

  const next = () => {
    if (state.step === 5) {
      const err = validateBaseline(state);
      if (err) {
        toast.error(err.message, { description: `Error: ${err.code}` });
        return;
      }
    }
    setState((s) => ({ ...s, step: s.step + 1 }));
  };

  const handleGenerateComplete = useCallback((sig: number[]) => {
    setState((s) => ({ ...s, signature: sig, step: s.step + 1 }));
  }, []);

  const handleMintSbt = useCallback(async () => {
    setTxAction('mint');
    toast.info('(Mock) Minting SBT…');
    await new Promise((r) => setTimeout(r, 2000));
    setMockHasMinted(true);
    setNeedsMatrixUpdate(true);
    toast.success('(Mock) SBT minted successfully!');
    setTxAction(null);
  }, []);

  const handleUpdateMatrix = useCallback(async () => {
    if (state.signature.length !== 256) {
      toast.error(t('wizard.matrixNotReady'));
      return;
    }
    setTxAction('update');
    toast.info('(Mock) Updating Matrix…');
    await new Promise((r) => setTimeout(r, 2000));
    setNeedsMatrixUpdate(false);
    setState((s) => ({ ...s, step: 0 }));
    setShowAgentNudge(true);
    toast.success('(Mock) Matrix updated successfully!');
    setTxAction(null);
  }, [state.signature, t]);

  const refreshOnchainState = useCallback(async () => {
    // no-op in mock mode
  }, []);

  const value: TwinMatrixContextValue = {
    address: MOCK_ADDRESS,
    isConnected: true,
    walletAddress: MOCK_WALLET_DISPLAY,
    isWrongNetwork: false,
    openConnectModal: () => toast.info('(Mock) Connect modal would open'),
    disconnect: () => toast.info('(Mock) Disconnect'),
    switchToBscTestnet: () => { },
    isSwitchingNetwork: false,
    isContractConfigured: true,
    isCheckingToken: false,
    contractError: null,
    tokenId: mockHasMinted ? MOCK_TOKEN_ID : null,
    hasMintedSbt: mockHasMinted,
    latestVersion: mockHasMinted ? 2 : 0,
    versions: mockHasMinted ? MOCK_VERSIONS : [],
    boundAgents: [],
    refreshOnchainState,
    state,
    setState,
    next,
    handleGenerateComplete,
    txAction,
    handleMintSbt,
    handleUpdateMatrix,
    needsMatrixUpdate,
    setNeedsMatrixUpdate,
    showAgentNudge,
    setShowAgentNudge,
  };

  return <TwinMatrixContext.Provider value={value}>{children}</TwinMatrixContext.Provider>;
};

// ─── Real Provider (unchanged logic) ─────────────────────────────
const RealTwinMatrixProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient({ chainId: BSC_TESTNET_CHAIN_ID });
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<WizardState>(initialState);
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [latestVersion, setLatestVersion] = useState(0);
  const [versions, setVersions] = useState<OnchainVersion[]>([]);
  const [boundAgents, setBoundAgents] = useState<OnchainBoundAgent[]>([]);
  const [contractError, setContractError] = useState<string | null>(null);
  const [needsMatrixUpdate, setNeedsMatrixUpdate] = useState(false);
  const [showAgentNudge, setShowAgentNudge] = useState(false);

  const walletAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : undefined;
  const hasMintedSbt = tokenId !== null;
  const isWrongNetwork = isConnected && chainId !== BSC_TESTNET_CHAIN_ID;

  const next = () => {
    if (state.step === 5) {
      const err = validateBaseline(state);
      if (err) {
        toast.error(err.message, { description: `Error: ${err.code}` });
        return;
      }
    }
    setState((s) => ({ ...s, step: s.step + 1 }));
  };

  const handleGenerateComplete = useCallback((sig: number[]) => {
    setState((s) => ({ ...s, signature: sig, step: s.step + 1 }));
  }, []);

  const refreshOnchainState = useCallback(async () => {
    if (!publicClient || !address || !isContractConfigured) return;

    setIsCheckingToken(true);
    setContractError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rc = publicClient.readContract as any;

      const currentTokenId = await rc({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'tokenIdOf',
        args: [address],
      });

      const versionCountRaw = await rc({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getVersionCount',
        args: [currentTokenId],
      });
      const versionCount = Number(versionCountRaw);

      const latestVersionRaw = await rc({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'latestVersion',
        args: [currentTokenId],
      });
      const latestVersionNumber = Number(latestVersionRaw);

      const versionRows: OnchainVersion[] = [];
      for (let version = versionCount; version >= 1; version--) {
        const [digest, blockNumber] = await rc({
          address: TWIN_MATRIX_SBT_ADDRESS,
          abi: twinMatrixSbtAbi,
          functionName: 'getVersionMeta',
          args: [currentTokenId, version],
        });
        const matrixAtVersion = await rc({
          address: TWIN_MATRIX_SBT_ADDRESS,
          abi: twinMatrixSbtAbi,
          functionName: 'getMatrixAtVersion',
          args: [currentTokenId, version],
        });
        versionRows.push({
          version,
          blockNumber: Number(blockNumber),
          digest,
          matrix: decodeMatrixToSignature(matrixAtVersion),
        });
      }

      const boundAgentAddresses = await rc({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'getBoundAgents',
        args: [currentTokenId],
      });

      const usdtDecimals = hasValidUsdtAddress
        ? Number(await rc({
          address: usdtContractAddress as `0x${string}`,
          abi: erc20BalanceAbi,
          functionName: 'decimals',
        }))
        : 18;

      const boundAgentRows: OnchainBoundAgent[] = await Promise.all(
        boundAgentAddresses.map(async (agentAddress: `0x${string}`) => {
          const [permissionMask, permissionExpiry, profile, usdtBalanceWei] = await Promise.all([
            rc({
              address: TWIN_MATRIX_SBT_ADDRESS,
              abi: twinMatrixSbtAbi,
              functionName: 'permissionMaskOf',
              args: [currentTokenId, agentAddress],
            }),
            rc({
              address: TWIN_MATRIX_SBT_ADDRESS,
              abi: twinMatrixSbtAbi,
              functionName: 'permissionExpiryOf',
              args: [currentTokenId, agentAddress],
            }),
            resolveAgentProfileFromErc8004(publicClient, agentAddress),
            hasValidUsdtAddress
              ? rc({
                address: usdtContractAddress as `0x${string}`,
                abi: erc20BalanceAbi,
                functionName: 'balanceOf',
                args: [agentAddress],
              })
              : Promise.resolve(null),
          ]);

          const short = `${agentAddress.slice(0, 6)}…${agentAddress.slice(-4)}`;
          const scopeGranted = permissionMaskToGrantedScope(permissionMask);
          return {
            name: profile?.name ?? `Agent ${short}`,
            address: agentAddress,
            tokenId: profile?.tokenId ?? null,
            permissionMask,
            permissionExpiry,
            usdtBalanceWei,
            usdtDecimals,
            permissionMaskBinary256: permissionMaskToBinary256(permissionMask),
            scopeGranted,
            active: permissionMask > 0n,
          };
        }),
      );

      setTokenId(currentTokenId);
      setLatestVersion(latestVersionNumber);
      setVersions(versionRows);
      setBoundAgents(boundAgentRows);
    } catch (error) {
      if (isTokenNotFoundError(error)) {
        setTokenId(null);
        setLatestVersion(0);
        setVersions([]);
        setBoundAgents([]);
        setNeedsMatrixUpdate(false);
      } else {
        const message = error instanceof BaseError ? error.shortMessage : String(error);
        setContractError(message);
        toast.error('Failed to load TwinMatrixSBT state');
      }
    } finally {
      setIsCheckingToken(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setTokenId(null);
      setLatestVersion(0);
      setVersions([]);
      setBoundAgents([]);
      setContractError(null);
      return;
    }
    void refreshOnchainState();
  }, [isConnected, address, refreshOnchainState]);

  const handleMintSbt = useCallback(async () => {
    if (!publicClient || !isConnected) return;
    if (isWrongNetwork) {
      toast.error(t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)'));
      return;
    }
    try {
      setTxAction('mint');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = await (writeContractAsync as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'mint',
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info(t('wizard.mintSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(true);
      toast.success(t('wizard.mintSuccess'), {
        description: (
          <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer" className="underline">
            View tx on BscScan
          </a>
        ),
      });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`Mint failed: ${message}`);
    } finally {
      setTxAction(null);
    }
  }, [publicClient, isConnected, refreshOnchainState, writeContractAsync, isWrongNetwork]);

  const handleUpdateMatrix = useCallback(async () => {
    if (!publicClient || tokenId === null) return;
    if (isWrongNetwork) {
      toast.error(t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)'));
      return;
    }
    if (state.signature.length !== 256) {
      toast.error(t('wizard.matrixNotReady'));
      return;
    }
    try {
      setTxAction('update');
      const matrix = encodeSignatureToMatrix(state.signature);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = await (writeContractAsync as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'updateMatrix',
        args: [tokenId, matrix],
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      toast.info(t('wizard.updateSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshOnchainState();
      setNeedsMatrixUpdate(false);
      setState((s) => ({ ...s, step: 0 }));
      setShowAgentNudge(true);
      toast.success(t('wizard.updateSuccess'), {
        description: (
          <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer" className="underline">
            View tx on BscScan
          </a>
        ),
      });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`Update failed: ${message}`);
    } finally {
      setTxAction(null);
    }
  }, [publicClient, tokenId, state.signature, writeContractAsync, refreshOnchainState, isWrongNetwork]);

  const switchToBscTestnet = useCallback(() => {
    switchChain({ chainId: BSC_TESTNET_CHAIN_ID });
  }, [switchChain]);

  const value: TwinMatrixContextValue = {
    address,
    isConnected,
    walletAddress,
    isWrongNetwork,
    openConnectModal,
    disconnect,
    switchToBscTestnet,
    isSwitchingNetwork,
    isContractConfigured,
    isCheckingToken,
    contractError,
    tokenId,
    hasMintedSbt,
    latestVersion,
    versions,
    boundAgents,
    refreshOnchainState,
    state,
    setState,
    next,
    handleGenerateComplete,
    txAction,
    handleMintSbt,
    handleUpdateMatrix,
    needsMatrixUpdate,
    setNeedsMatrixUpdate,
    showAgentNudge,
    setShowAgentNudge,
  };

  return <TwinMatrixContext.Provider value={value}>{children}</TwinMatrixContext.Provider>;
};

// ─── Export: auto-select provider based on env ───────────────────
export const TwinMatrixProvider = ({ children }: { children: ReactNode }) => {
  if (IS_MOCK_MODE) {
    return <MockTwinMatrixProvider>{children}</MockTwinMatrixProvider>;
  }
  return <RealTwinMatrixProvider>{children}</RealTwinMatrixProvider>;
};
