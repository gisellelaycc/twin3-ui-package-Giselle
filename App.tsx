import { Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "./contexts/ThemeContext";
import { wagmiConfig } from "./lib/wallet/config";
import { TwinMatrixProvider } from "./contexts/TwinMatrixContext";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import MintPage from "./pages/MintPage";
import MatrixPage from "./pages/MatrixPage";

import AgentsOverviewPage from "./pages/agents/AgentsOverviewPage";
import AgentsConnectPage from "./pages/agents/AgentsConnectPage";
import AgentsSkillPage from "./pages/agents/AgentsSkillPage";
import AgentsApiPage from "./pages/agents/AgentsApiPage";
import AgentsExamplesPage from "./pages/agents/AgentsExamplesPage";
import AgentsConsolePage from "./pages/agents/AgentsConsolePage";
import SoulWizardPage from "./pages/SoulWizardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Error boundary to catch initialization failures (e.g., invalid WalletConnect config)
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0a0e17, #1a1e2e)",
            color: "#f0f0f0",
            fontFamily: "Inter, system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#0AFFFF" }}>
              ⚠️ Twin Matrix — Configuration Error
            </h1>
            <p style={{ lineHeight: 1.7, opacity: 0.8 }}>
              The application could not initialize. This is usually caused by a
              missing or invalid <code>VITE_WALLETCONNECT_PROJECT_ID</code>.
            </p>
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.5 }}>
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.5rem",
                background: "#0AFFFF",
                color: "#001515",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
    <WagmiProvider config={wagmiConfig}>
      <ThemeProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={lightTheme({
                accentColor: "#2D6A4F",
                accentColorForeground: "#FFFFFF",
                borderRadius: "medium",
                overlayBlur: "small",
                fontStack: "system",
              })}
            >
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <TwinMatrixProvider>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/verify" element={<VerifyPage />} />
                      <Route path="/mint" element={<MintPage />} />
                      <Route path="/matrix" element={<MatrixPage />} />

                      <Route path="/agents" element={<AgentsOverviewPage />} />
                      <Route path="/agents/connect" element={<AgentsConnectPage />} />
                      <Route path="/agents/skill" element={<AgentsSkillPage />} />
                      <Route path="/agents/api" element={<AgentsApiPage />} />
                      <Route path="/agents/examples" element={<AgentsExamplesPage />} />
                      <Route path="/agents/console" element={<AgentsConsolePage />} />
                      <Route path="/soul" element={<SoulWizardPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TwinMatrixProvider>
                </BrowserRouter>
              </TooltipProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </WagmiProvider>
  </AppErrorBoundary>
);

export default App;
