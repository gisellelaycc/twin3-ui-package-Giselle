import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bscTestnet } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '';
const rpcUrl = (import.meta.env.RPC_URL ?? '').trim();

const chain = rpcUrl
  ? {
    ...bscTestnet,
    rpcUrls: {
      ...bscTestnet.rpcUrls,
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  }
  : bscTestnet;

export const BSC_TESTNET_CHAIN_ID = chain.id;

// Determine if we have a valid WalletConnect project ID
// A valid project ID is a 32-char hex string (not all zeros)
const isValidProjectId =
  /^[a-f0-9]{32}$/i.test(projectId) && !/^0+$/.test(projectId);

// Use RainbowKit's getDefaultConfig when projectId is valid,
// otherwise use a basic wagmi config that works without WalletConnect.
export const wagmiConfig = isValidProjectId
  ? getDefaultConfig({
    appName: 'Twin Matrix',
    projectId,
    chains: [chain],
    ssr: false,
  })
  : createConfig({
    chains: [chain],
    transports: {
      [chain.id]: http(),
    },
  });
