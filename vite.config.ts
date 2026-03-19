import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: true,
      },
      proxy: {
        "/api": {
          target: env.VITE_DEV_PROXY_TARGET || "https://agent.twin3.ai",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    define: {
      "import.meta.env.RPC_URL": JSON.stringify(env.RPC_URL ?? ""),
      "import.meta.env.ERC8004_CONTRACT_ADDRESS": JSON.stringify(env.ERC8004_CONTRACT_ADDRESS ?? ""),
      "import.meta.env.TWIN_MATRIX_SBT_ADDRESS": JSON.stringify(env.TWIN_MATRIX_SBT_ADDRESS ?? ""),
      "import.meta.env.USDT_CONTRACT_ADDRESS": JSON.stringify(env.USDT_CONTRACT_ADDRESS ?? ""),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
