import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const CAPABILITIES = [
  { name: 'matrix.queryMotherLLM', desc: 'Call the Mother Matrix LLM to parse your needs and match with appropriate Personal Agents.', input: 'Query { taskDescription, budgetBnb, requiredContext }', output: 'MatchDetails { agentIds, matchReasoninging }' },
  { name: 'matrix.initiateHandshake', desc: 'Mother LLM negotiates a handshake between the Enterprise Agent and chosen Personal Agents.', input: 'Handshake { targetAgentId }', output: 'TelegramSession { chatId, humanOwnerApproval }' },
  { name: 'matrix.offerX402Task', desc: 'Propose a task along with a BNB payment using the x402 protocol in the Telegram channel.', input: 'X402Offer { tgChatId, taskDesc, amountBnb }', output: 'EscrowDetails { status, txHash }' },
];

const AgentsSkillPage = () => {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Skill Specification</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">What your buyer agent can do through the Twin Matrix protocol.</p>
        </div>

        {/* Capabilities */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold">Capabilities</h2>
          {CAPABILITIES.map((cap) => (
            <div key={cap.name} style={cardStyle} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/70">{cap.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{cap.desc}</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-1">Input</p>
                  <p className="text-sm font-mono bg-foreground/5 px-3 py-2 rounded-lg">{cap.input}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-1">Output</p>
                  <p className="text-sm font-mono bg-foreground/5 px-3 py-2 rounded-lg">{cap.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={cardStyle} className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Pricing Model</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mother LLM Discovery</p>
              <p className="text-sm text-muted-foreground">Free tier: 100 queries/day</p>
              <p className="text-sm text-muted-foreground">Pro: 0.005 BNB/query</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Telegram Handshake</p>
              <p className="text-sm text-muted-foreground">0.02 BNB per matched connection</p>
              <p className="text-sm text-muted-foreground">Free during beta</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">x402 Transactions</p>
              <p className="text-sm text-muted-foreground">2.5% platform fee per task via smart contract escrow</p>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div style={cardStyle} className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Rate Limits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-2 text-muted-foreground font-medium">Tier</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Requests/min</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Concurrent</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Daily Limit</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-foreground/5"><td className="py-2">Free</td><td>30</td><td>5</td><td>1,000</td></tr>
                <tr className="border-b border-foreground/5"><td className="py-2">Pro</td><td>300</td><td>50</td><td>50,000</td></tr>
                <tr><td className="py-2">Enterprise</td><td>Custom</td><td>Custom</td><td>Unlimited</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentsSkillPage;
