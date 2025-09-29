# Foresight Treasury Dashboard

## Problem Statement

Decentralized Autonomous Organizations manage billions in treasury assets without systematic risk management frameworks. Treasury decisions are typically reactive, politically influenced, and made without clear visibility into concentration risks, runway projections, or optimal allocation strategies. The public nature of blockchain transactions creates a paradox: treasuries need transparency for governance while requiring privacy for operational security. Current solutions either expose sensitive position data or require complex custom integrations that limit adoption.

Three critical gaps exist:

**Visibility**: Treasury health metrics require manual analysis across multiple wallets and chains. Real-time risk assessment is absent, leaving DAOs blind to emerging threats until damage occurs.

**Decision Framework**: Without rule-based allocation policies and automated recommendations, governance debates extend indefinitely while treasuries drift toward dangerous positions.

**Privacy vs Transparency**: DAOs need external audits and member accountability but exposing detailed position data creates attack vectors and competitive disadvantages.

## Solution

Foresight deploys an AI-powered treasury intelligence system that analyzes DAO positions, flags concentration risks, forecasts runway, and generates governance-ready rebalancing proposals. The system leverages Midnight blockchain for privacy-preserving transaction handling and report generation, ensuring sensitive treasury data remains confidential while maintaining auditability.

### Core Features

**Real-Time Risk Analysis**
The system continuously monitors treasury composition, computing total value locked, stablecoin ratios, single-asset concentration, and volatility-adjusted runway. Risk scores combine multiple weighted factors to provide a unified health metric that triggers alerts when thresholds breach.

**Automated Allocation Recommendations**
A rule-based allocation engine applies configurable policies to generate specific rebalancing actions. The system suggests precise swap amounts (e.g., "Reduce DGOV from 500 to 255 tokens") while respecting per-cycle movement caps and per-asset concentration limits. Recommendations come with governance-ready proposal text and execution rationale.

**Privacy-Preserving Operations**
Integration with Midnight blockchain enables private transaction handling and confidential report generation. Full treasury analysis gets sealed while only sanitized summaries are exposed publicly. The system maintains operational security without sacrificing governance transparency.

**Interactive Treasury Assistant**
A conversational interface allows DAO members to query specific aspects of treasury health, request detailed token analysis, or explore hypothetical rebalancing scenarios. The assistant contextualizes recommendations based on current market conditions and DAO-specific policies.

### Technical Architecture

**Frontend**: Next.js 15 with TypeScript and Tailwind CSS provides the dashboard interface. Real-time updates via API polling ensure current data display.

**Analysis Engine**: Custom TypeScript implementation handles balance aggregation, price fetching with caching, and risk metric computation. The calculation layer applies deterministic formulas for TVL, ratios, concentration, and runway projections.

**AI Agent**: Custom built agent processes treasury data, applies allocation policies, and generates natural language explanations. The agent maintains conversation context for multi-turn interactions.

**Privacy Layer**: Midnight MCP integration enables private transaction submission and confidential data storage. Wallet operations occur through privacy-preserving protocols while maintaining auditability for authorized parties.

**Data Sources**: Ethereum wallet balance reading via ethers.js, price feeds from CoinGecko API with 5-minute caching to minimize rate limiting.

### Calculation Methodology

Risk assessment combines four weighted metrics:

**Stablecoin Ratio**: Percentage of treasury value held in USDC, USDT, DAI, DFUND, and similar assets. Lower ratios increase volatility exposure.

**Concentration Risk**: Largest single position as percentage of total value. High concentration creates liquidation vulnerability.

**Runway**: Months of operational funding remaining given current burn rate, adjusted for volatile asset haircuts (30% discount on non-stablecoins).

**Risk Score**: Normalized 0-100 metric weighting stablecoin deviation (40%), concentration excess (30%), and runway shortfall (30%).

Allocation recommendations follow policy-driven rules:
- Target stablecoin band with tolerance (e.g., 40-60%)
- Maximum per-asset cap (e.g., 35% TVL)
- Maximum movement per cycle (e.g., 20% TVL)
- Preferential swaps from largest volatile positions

## Future Enhancements

**Multi-Chain Aggregation**
Extend balance reading to Polygon, Arbitrum, Optimism, and other L2s. Implement cross-chain position normalization for unified treasury view across all deployment networks.

**Historical Trend Analysis**
Store time-series data for treasury composition changes. Generate charts showing allocation drift, risk score evolution, and runway trends over weeks and months. Enable pattern recognition for recurring treasury management issues.

**Predictive Modeling**
Apply machine learning to historical spend patterns for improved burn rate forecasting. Implement Monte Carlo simulation for runway projections under various market scenarios. Generate probability distributions for treasury depletion timelines.

**Automated Execution**
Integration with Gnosis Safe API and multisig tooling for proposal submission. Implement approval workflows where proposals move directly from Foresight to on-chain voting. Optional automated execution for pre-approved policy-based rebalancing.

**Advanced Privacy Features**
Zero-knowledge proofs for treasury attestations without revealing positions. Selective disclosure protocols allowing auditors to verify specific metrics without full data access. Private computation for competitive analysis between DAOs.

**Compliance Framework**
Configurable regulatory requirement tracking (e.g., stablecoin reserve minimums, jurisdiction-specific asset restrictions). Automated audit trail generation with cryptographic proofs of policy adherence. Integration with tax reporting systems for treasury activity.

**DeFi Integration**
Yield optimization recommendations for idle stablecoin positions. Liquidity provision analysis for treasury-owned tokens. Lending protocol integration for interest-bearing stablecoin deployment while maintaining liquidity targets.

**Governance Integration**
Direct API connections to Snapshot, Tally, and on-chain governance contracts. Automated proposal formatting for specific DAO platforms. Voting delegation analysis showing treasury decision stakeholder composition.

## Repository Structure

```
foresight/
├── app/                    # Next.js pages and API routes
│   ├── dashboard/          # Main dashboard interface
│   ├── api/               # Analysis and chat endpoints
│   └── layout.tsx         # Root layout with providers
├── lib/
│   ├── treasury/          # Analysis and allocation logic
│   ├── midnight/          # Privacy layer integration
│   └── ai/                # Agent implementation
└── types/                 # TypeScript definitions
```

## Setup Instructions

Install dependencies:
```bash
pnpm install
```

Configure environment variables in `.env.local`:
```
MIDNIGHT_WALLET_ADDRESS=your_wallet_address
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Run development server:
```bash
pnpm dev
```

Access dashboard at `http://localhost:3000/dashboard`

## Technology Stack

- Next.js 14 with App Router
- TypeScript for type safety
- Midnight MCP for privacy-preserving blockchain operations
- Tailwind CSS for styling
- ethers.js for Ethereum interaction
- CoinGecko API for price data

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built for the DEGA Hackathon - AI for DAO Treasury Management track. Leverages Midnight blockchain infrastructure for privacy-preserving treasury operations.