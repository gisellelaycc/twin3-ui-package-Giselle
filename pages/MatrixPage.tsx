import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { OnchainIdentityStatePage } from '@/components/twin-matrix/pages/OnchainIdentityStatePage';
import { AuthStep } from '@/components/twin-matrix/steps/AuthStep';
import { AgentPermissionEditPage } from '@/components/twin-matrix/pages/AgentPermissionEditPage';
import { MissionsPage } from '@/components/twin-matrix/pages/MissionsPage';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import openClaw from '@/assets/openclaw.svg';

type MatrixTab = 'matrix' | 'agents' | 'exchange';

const MatrixPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    isContractConfigured,
    isCheckingToken,
    contractError,
    tokenId,
    hasMintedSbt,
    latestVersion,
    versions,
    boundAgents,
    refreshOnchainState,
    setState,
    setNeedsMatrixUpdate,
    walletAddress,
    address,
    state,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToBscTestnet,
  } = useTwinMatrix();

  const [tab, setTab] = useState<MatrixTab>('matrix');
  const [agentView, setAgentView] = useState<'list' | 'form' | 'edit'>('list');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)'
  };

  const tabBtn = (id: MatrixTab, label: string) =>
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`text-sm uppercase tracking-widest font-medium transition-colors px-1 pb-2 ${tab === id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
    >
      {label}
    </button>;

  // Not connected — prompt to connect
  if (!isConnected) {
    return (
      <PageLayout activePage="identity">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6" style={cardStyle}>
            <h2 className="text-xl font-heading font-bold">Connect Wallet</h2>
            <p className="text-muted-foreground text-base md:text-lg">Connect your wallet to view your Twin Matrix identity.</p>
            <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 w-full">
              Connect Wallet
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Connected but no SBT — redirect to mint
  if (!isCheckingToken && !contractError && !hasMintedSbt) {
    return (
      <PageLayout activePage="identity">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6" style={cardStyle}>
            <h2 className="text-xl font-heading font-bold">No Identity Found</h2>
            <p className="text-muted-foreground text-base md:text-lg">You haven't created your Twin Matrix yet. Start by verifying your humanity.</p>
            <button onClick={() => navigate('/verify')} className="btn-twin btn-twin-primary py-4 px-8 w-full">
              Create Identity
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const maxAgentSlots = 3;
  const currentAgent = boundAgents[0] || null;

  return (
    <PageLayout activePage="identity">
      <div className="max-w-6xl mx-auto w-full space-y-6 py-4">
        {!isContractConfigured && (
          <div className="mb-3 transition-all duration-300" style={{ border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '16px', padding: '1.25rem 1.75rem', background: 'rgba(250, 204, 21, 0.06)' }}>
            <p className="text-sm text-yellow-200 text-center">⚠️ Contract address not configured — on-chain features are disabled in this preview.</p>
          </div>
        )}

        {isCheckingToken && (
          <div className="text-center mt-12" style={cardStyle}>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-2">TwinMatrixSBT</p>
            <p className="text-base">{t('wizard.checkingIdentity')}</p>
          </div>
        )}

        {!isCheckingToken && contractError && (
          <div className="mt-8" style={{ border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', padding: '1.75rem', background: 'rgba(244, 63, 94, 0.06)' }}>
            <p className="text-base text-destructive">{t('wizard.failedFetchContract')}</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">{contractError}</p>
            <button onClick={() => void refreshOnchainState()} className="mt-4 py-3 px-6 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
              {t('wizard.retry')}
            </button>
          </div>
        )}

        {!isCheckingToken && !contractError && hasMintedSbt && (
          <>
            {/* Tab bar */}
            <div className="flex gap-6 border-b border-foreground/10">
              {tabBtn('matrix', 'Twin Matrix')}
              {tabBtn('agents', 'Agents')}
              {tabBtn('exchange', 'The Exchange')}
            </div>

            {tab === 'matrix' && (
              <div className="animate-fade-in">
                <OnchainIdentityStatePage
                  tokenId={tokenId}
                  walletAddress={walletAddress}
                  latestVersion={latestVersion}
                  versions={versions}
                  boundAgents={boundAgents}
                  onReconfigure={() => {
                    setNeedsMatrixUpdate(true);
                    setState((s) => ({ ...s, step: 2, activeModules: s.activeModules.filter((m) => m === 'sport') }));
                    navigate('/mint');
                  }}
                  onSetupAgent={() => { setTab('agents'); setAgentView('form'); }}
                  onRefresh={() => void refreshOnchainState()}
                  isRefreshing={isCheckingToken}
                />
              </div>
            )}

            {tab === 'agents' && (
              <div className="animate-fade-in">
                {agentView === 'form' ? (
                  <AuthStep
                    data={state.agentSetup}
                    onUpdate={(d) => setState((s) => ({ ...s, agentSetup: d }))}
                    onNext={() => { }}
                    onDashboard={() => {
                      void refreshOnchainState();
                      setAgentView('list');
                    }}
                    ownerAddress={address}
                    tokenId={tokenId}
                  />
                ) : agentView === 'edit' && editingAgent && tokenId !== null ? (
                  (() => {
                    const agent = boundAgents.find((a) => a.address.toLowerCase() === editingAgent.toLowerCase());
                    if (!agent) return <p className="text-muted-foreground">Agent not found.</p>;
                    return (
                      <AgentPermissionEditPage
                        tokenId={tokenId}
                        agent={agent}
                        isWrongNetwork={isWrongNetwork}
                        isSwitchingNetwork={isSwitchingNetwork}
                        onSwitchNetwork={switchToBscTestnet}
                        onBack={() => { setAgentView('list'); setEditingAgent(null); }}
                        onUpdated={() => { void refreshOnchainState(); setAgentView('list'); setEditingAgent(null); }}
                      />
                    );
                  })()
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>Personal Agents</h2>
                      <p className="text-base md:text-lg text-muted-foreground mt-1">Your agents holding ERC-8004 IDs, acting on your behalf via the Mother Matrix LLM.</p>
                    </div>

                    {/* Agent Profile Card */}
                    <div style={cardStyle} className="space-y-4">
                      <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Matrix Transmission Card</p>
                      <p className="text-sm text-muted-foreground">This is how buyer agents see your listing.</p>
                      <div className="rounded-xl border border-foreground/10 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={openClaw} alt="OpenClaw" className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="text-sm font-medium">{walletAddress}</p>
                            <p className="text-sm text-muted-foreground">Verified Human · v{latestVersion}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['sport', 'running', 'marathon', 'fitness'].map((tag) => (
                            <span key={tag} className="text-sm font-mono px-2 py-0.5 rounded-md bg-foreground/5">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Agent Slots */}
                    <div className="space-y-3">
                      {/* Slot 1: Active or empty */}
                      {currentAgent ? (
                        <div style={cardStyle} className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{currentAgent.name}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">Slot 1</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${currentAgent.active ? 'bg-[hsla(164,24%,74%,0.15)] text-[hsl(164,24%,74%)]' : 'bg-foreground/10 text-muted-foreground'}`}>
                                {currentAgent.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm font-mono text-muted-foreground mt-1 truncate">{currentAgent.address}</p>
                          </div>
                          <button
                            onClick={() => { setEditingAgent(currentAgent.address); setAgentView('edit'); }}
                            className="shrink-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Manage →
                          </button>
                        </div>
                      ) : (
                        <div style={cardStyle} className="text-center py-8 space-y-4">
                          <img src={openClaw} alt="OpenClaw" className="w-12 h-12 mx-auto" />
                          <p className="text-sm text-muted-foreground">No agents bound yet. Activate an agent to start earning.</p>
                          <button
                            onClick={() => {
                              if (!hasMintedSbt) { toast.error('Mint your identity first'); return; }
                              setAgentView('form');
                            }}
                            className="btn-twin btn-twin-primary py-3 px-6 text-sm"
                          >
                            Activate Agent
                          </button>
                        </div>
                      )}

                      {/* Slot 2 & 3: Locked */}
                      {[2, 3].map((slot) => (
                        <div key={slot} style={{ ...cardStyle, opacity: 0.5 }} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Agent Slot {slot}</p>
                              <p className="text-sm text-muted-foreground/60">Awaiting unlock — coming soon</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">Locked</span>
                        </div>
                      ))}
                    </div>

                    {currentAgent && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">1 / {maxAgentSlots} slot(s) used</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'exchange' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>THE EXCHANGE</h2>
                  <p className="text-base md:text-lg text-muted-foreground mt-1">Where agents seek human experience.</p>
                </div>
                <p className="text-sm text-muted-foreground">Explore live requests from agent systems and decide how your identity participates.</p>
                <MissionsPage />
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default MatrixPage;
