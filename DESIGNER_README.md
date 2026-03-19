# Twin3 UI Package — For Designer

## Quick Start

```bash
npm install
npm run dev
```

App will be available at `http://localhost:8080`

> **Mock Mode is ON**: All wallet/blockchain interactions are simulated with mock data.
> You can freely navigate all pages without connecting a real wallet.

## Lovable Import

This project is Lovable-compatible. You can import this zip directly into Lovable.

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page |
| `/verify` | VerifyPage | Identity verification flow |
| `/mint` | MintPage | SBT minting page |
| `/matrix` | MatrixPage | Twin Matrix dashboard |
| `/soul` | SoulWizardPage | Soul profile wizard (multi-step) |
| `/agents` | AgentsOverviewPage | Agent system overview |
| `/agents/connect` | AgentsConnectPage | Connect agent flow |
| `/agents/skill` | AgentsSkillPage | Agent skills config |
| `/agents/api` | AgentsApiPage | API documentation |
| `/agents/examples` | AgentsExamplesPage | Usage examples |
| `/agents/console` | AgentsConsolePage | Agent console |

## What You CAN Change

- `src/components/` — All UI components (shadcn/ui + custom)
- `src/pages/` — Page layouts and content (JSX/CSS)
- `src/index.css` — Global styles
- `src/App.css` — App-level styles
- `tailwind.config.ts` — Tailwind theme (colors, fonts, spacing)
- `src/assets/` — Images and icons
- `public/` — Static assets (favicon, etc.)

## What You Should NOT Change

- `src/contexts/TwinMatrixContext.tsx` — Core business logic
- `src/lib/contracts/` — Smart contract ABIs
- `src/lib/wallet/` — Wallet configuration
- `src/lib/twin-encoder/` — Matrix encoding algorithm
- `src/integrations/` — Backend integrations
- `vite.config.ts` — Build configuration
- `.env` — Environment variables

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **i18n**: Custom (see `src/lib/i18n.tsx`)

## Collaboration Workflow

1. Make your UI changes in Lovable or locally
2. Push changes to the `ui/designer` branch on GitHub
3. Create a Pull Request for review
