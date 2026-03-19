/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RPC_URL?: string;
  readonly ERC8004_CONTRACT_ADDRESS?: string;
  readonly TWIN_MATRIX_SBT_ADDRESS?: string;
  readonly USDT_CONTRACT_ADDRESS?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_BACKEND_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
