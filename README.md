# Foresight - AI-Powered DAO Treasury Intelligence

## Problem Statement

DAOs manage billions in treasury assets but lack systematic risk management and allocation strategies. Treasury decisions are often reactive, politically charged, and made without clear data on runway projections or concentration risks. Most DAOs face three critical gaps:

1. **Visibility Gap**: Treasury health metrics (stablecoin ratios, runway forecasts, volatility exposure) require manual analysis across multiple wallets and chains
2. **Decision Paralysis**: Without clear risk thresholds and rule-based allocation frameworks, governance debates drag on while treasuries drift toward dangerous positions
3. **Privacy vs Transparency Conflict**: DAOs need external audits and member accountability, but exposing detailed position data creates security risks and competitive disadvantages

Current solutions either require custom smart contract integrations (limiting adoption) or expose sensitive treasury data publicly (creating attack vectors). DAOs need plug-and-play treasury intelligence that works with existing infrastructure while maintaining operational privacy.

## Solution: Foresight

Foresight deploys two coordinated AI agents that analyze DAO treasuries, flag risks early, and generate governance-ready rebalancing proposals—all while sealing sensitive analysis in privacy-preserving reports.

**Agent A - Risk & Runway Monitor:**
- Ingests wallet balances from standard addresses (Gnosis Safe, EOAs, multisigs)
- Fetches real-time token prices and computes key metrics: stablecoin ratio, concentration risk, volatility-adjusted runway
- Monitors configurable thresholds (e.g., "alert if stables drop below 40%")
- When thresholds breach, triggers Agent B via DEGA Communication MCP

**Agent B - Allocation Advisor:**
- Receives trigger from Agent A or runs scheduled analysis
- Applies deterministic allocation rules (target stable bands, per-asset caps, max move limits)
- Generates specific rebalancing actions (e.g., "Swap 10 ETH → USDC to restore 50% stable ratio")
- Produces governance proposal with human-readable rationale and executable JSON

**Privacy Layer (Midnight):**
- Full analysis (raw positions, detailed metrics, agent reasoning) sealed in private artifacts
- Only sanitized summaries and artifactId exposed publicly
- Auditors/multisig signers access full report via secure artifact retrieval

**Dashboard:**
- Real-time treasury health metrics and runway projections
- Visual risk alerts when thresholds breach
- Governance proposal preview with export to multisig tools
- Link to sealed Midnight artifact for authorized review

## Technical Architecture

**Stack:**
- ElizaOS: Agent orchestration and decision logic
- Midnight.js: Privacy-preserving report sealing
- DEGA AI MCP: Treasury data normalization and financial calculations
- DEGA Communication MCP: Inter-agent triggering and coordination
- Next.js: Dashboard interface

**Data Flow:**
DAO provides wallet addresses + config (monthly burn, risk thresholds, allocation policy) → Agents ingest balances/prices → Agent A analyzes risk → If threshold breached, triggers Agent B → Agent B generates rebalancing proposal → Coordinator merges outputs → Midnight seals full report → Dashboard displays public summary + governance exports

## Value Proposition

- **Plug-and-Play**: Works with any DAO's existing wallets—no contract rewrites needed
- **Proactive Risk Management**: Catches allocation drift before it becomes critical via automated threshold monitoring
- **Governance Efficiency**: Proposals write themselves with clear rationale, reducing debate cycles
- **Operational Privacy**: Share insights without exposing attack vectors via sealed reports
- **Deterministic & Auditable**: Rule-based allocation logic ensures defensible, reproducible decisions



+----------------------------------+
                         |            DAO / Users           |
                         |  - Treasury wallets (addresses)  |
                         |  - Config (monthly burn, policy) |
                         |  - Risk thresholds (trigger pts) |
                         +----------------+-----------------+
                                          |
                                          v
                +-------------------------+-------------------------+
                |                   Data Ingest                     |
                |  - Read on-chain balances (wallets / Gnosis)       |
                |  - Price feeds (CoinGecko / cached API)            |
                |  - Optional: CSV / historical spend uploads        |
                +-------------------------+-------------------------+
                                          |
             +----------------------------+----------------------------+
             |                             |                            |
             v                             v                            v
+-------------------------+     +-------------------------+    +---------------------+
|  Agent A: Risk & Runway |     | Agent B: Allocation     |    |  Local Libraries /  |
|  (Eliza agent)          |     | Advisor (Eliza agent)   |    |  Helpers (TS)       |
|  - Compute stablesRatio |     | - suggestRebalance()    |    |  - normalizeAmounts |
|  - compute riskScore    |     | - draft proposal JSON   |    |  - pricing helpers  |
|  - forecast runway      |     | - produce human text    |    |  - rules/policy     |
+-----------+-------------+     +-----------+-------------+    +----------+----------+
            |                               ^                             |
            |  [DEGA Communication MCP]     |                             |
            +------- (if risk > threshold) -+                             |
            |         triggers Agent B       |                             |
            |                               |                             |
            +---------------+---------------+-----------------------------+
                            |
                            v
                +-------------------------------+
                |     Coordinator / Orchestrator|
                |  - Aggregate agent outputs    |
                |  - Compose final report JSON  |
                |  - Log trigger events         |
                +---------------+---------------+
                                |
                                v
                +-------------------------------+
                |        Midnight MCP / SDK     |
                |  - Seal full analysis (private|
                |    artifact / zk-backed blob) |
                |  - Return artifactId + summary|
                +---------------+---------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+----------------------+                       +-----------------------+
|   Public Dashboard   |                       | Governance Output     |
|  - Public summary    |                       | - Proposal text (MD)  |
|  - Metrics & charts  |                       | - Proposal JSON (vote)|
|  - Risk alerts (UI)  |                       | - Export for multisig |
|  - Link → artifactId |                       | - Trigger timestamp   |
+----------------------+                       +-----------------------+
        |                                               |
        v                                               v
+----------------------+                       +-----------------------+
|  DAO Review / Vote   |                       | Multisig / Execution  |
| - Members view items |                       | - Manual or automated |
| - Vote on proposal   |                       |   execution (external)|
+----------------------+                       +-----------------------+