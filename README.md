# Paylit — B2B Pay-Transparency & Hiring-Disclosure Compliance Engine

Paylit is an enterprise B2B compliance monitor that continuously ingests, parses, and audits public career postings from Greenhouse, Lever, Ashby, and custom career portals against statutory pay transparency mandates across US states (CA, NY, CO, WA, IL, MA, Remote-US) and the European Union.

---

## Key Capabilities

1. **Deterministic Statutory Rule Engine (`/lib/rules`)**:
   - California SB 1162 (Cal. Lab. Code § 432.3): Mandatory salary ranges on 15+ employee postings.
   - New York State Labor Law § 194-b & NYC Local Law 32: Base salary/hourly disclosures.
   - NYC Local Law 144 & EU AI Act: Automated employment decision tool (AEDT) & bias-audit notifications.
   - Colorado Equal Pay for Equal Work Act (C.R.S. § 8-5-201): Salary range + comprehensive benefits & bonus overview.
   - Washington Equal Pay (RCW 49.58.110): Wage scale + benefits summary.
   - Illinois Equal Pay Act (820 ILCS 112/11): Pay scale + benefits description.
   - Massachusetts Salary Transparency (St. 2024, c. 182): Annual salary range or hourly wage disclosures.
   - Good-Faith Spread Enforcement: Flags listings where `(max - min) / min > 0.60`.
   - Paste-Ready ATS Remediations: Generates tailored compliance paragraphs for ATS job fields.

2. **Tamper-Proof Audit Vault & Cryptographic Chain**:
   - Every scan snapshot is sealed into an append-only ledger linked by SHA-256 hashes.
   - Provides outside counsel and labor commissioners with verifiable audit trails.
   - Print-optimized official Compliance Certificates (`@media print`).

3. **3D Scroll-Driven Experience**:
   - Pinned continuous 3D stage built procedurally with Three.js (`@react-three/fiber`, `@react-three/drei`).
   - Smooth inertia with Lenis; GSAP ScrollTrigger mapping camera dolly and device rotation across 6 narrative scenes.
   - Real dynamic UI textures, cherry-red volumetric rim lighting, and floating dust particle parallax.

---

## Environment Variables

Create a `.env` file in the project root:

```ini
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
RESEND_API_KEY=""                # Optional: Resend API key (console transport fallback used if blank)
CRON_SECRET="paylit-dev-cron-secret-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Installation & Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Generate Prisma Client and Initialize Database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

3. **Seed Database with Demo Monitor and Historical Scans**:
   ```bash
   node scripts/seed.mjs
   ```

4. **Run Unit Tests**:
   ```bash
   pnpm test
   ```

5. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser.

---

## How to Update or Add Statutory Compliance Rules

All statutory rules are defined as typed configuration objects in:
📁 `src/lib/rules/config.ts`

To add a new state law or modify an existing rule, update or add an entry to `STATUTORY_RULES`:

```typescript
export const STATUTORY_RULES: Record<string, ComplianceRuleConfig> = {
  CA: {
    code: "RULE_CA_SB1162",
    jurisdiction: "California",
    name: "California Pay Transparency Act",
    citation: "Cal. Lab. Code § 432.3 (SB 1162)",
    effectiveDate: "2023-01-01",
    lastReviewedDate: "2026-01-15",
    fineRange: { min: 1000, max: 10000 },
    requiresRange: true,
    maxGoodFaithSpreadRatio: 0.60,
    requiresBenefitsDisclosure: false,
    requiresAiScreeningDisclosure: false,
    description: "Requires employers with 15+ employees to disclose a good-faith pay scale.",
  },
  // Add new state configurations here...
};
```

Statutory evaluator logic and clause generation automatically consume these configurations without requiring changes to the core UI components.

---

## License & Compliance Disclaimer

*Automated screening aid, not legal advice.* Paylit is an automated auditing engine designed to assist internal talent acquisition and legal operations. Consult qualified employment counsel regarding statutory jurisdictional exposures.
