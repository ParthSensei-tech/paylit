export interface JurisdictionMatch {
  jurisdictions: string[]; // ["CA", "REMOTE_US", ...]
  isRegulated: boolean;
  detectedTokens: string[];
}

interface LocationRule {
  key: string;
  names: string[];
  patterns: RegExp[];
}

const JURISDICTION_RULES: LocationRule[] = [
  {
    key: "CA",
    names: ["California", "San Francisco", "Los Angeles", "San Diego", "San Jose", "Oakland", "Palo Alto", "Mountain View", "Sunnyvale", "Sacramento", "Irvine"],
    patterns: [
      /\bCA\b/,
      /\bCalifornia\b/i,
      /\bSan Francisco\b/i,
      /\bLos Angeles\b/i,
      /\bSan Diego\b/i,
      /\bSan Jose\b/i,
      /\bOakland,?\s*CA\b/i,
      /\bPalo Alto\b/i,
      /\bMountain View\b/i,
      /\bSunnyvale\b/i,
      /\bIrvine,?\s*CA\b/i,
      /\bSilicon Valley\b/i,
    ],
  },
  {
    key: "NY",
    names: ["New York", "NYC", "New York City", "Brooklyn", "Manhattan", "Queens", "Buffalo", "Albany", "Rochester"],
    patterns: [
      /\bNY\b/,
      /\bNYC\b/i,
      /\bNew York\b/i,
      /\bNew York City\b/i,
      /\bBrooklyn\b/i,
      /\bManhattan\b/i,
      /\bQueens,?\s*NY\b/i,
      /\bBuffalo,?\s*NY\b/i,
    ],
  },
  {
    key: "CO",
    names: ["Colorado", "Denver", "Boulder", "Colorado Springs", "Fort Collins"],
    patterns: [
      /\bCO\b/,
      /\bColorado\b/i,
      /\bDenver\b/i,
      /\bBoulder,?\s*CO\b/i,
      /\bColorado Springs\b/i,
      /\bFort Collins\b/i,
    ],
  },
  {
    key: "WA",
    names: ["Washington", "Seattle", "Bellevue", "Redmond", "Tacoma", "Spokane"],
    patterns: [
      /\bWA\b/,
      /\bWashington State\b/i,
      /\bSeattle\b/i,
      /\bBellevue,?\s*WA\b/i,
      /\bRedmond,?\s*WA\b/i,
      /\bTacoma\b/i,
    ],
  },
  {
    key: "IL",
    names: ["Illinois", "Chicago", "Naperville", "Evanston"],
    patterns: [
      /\bIL\b/,
      /\bIllinois\b/i,
      /\bChicago\b/i,
      /\bNaperville\b/i,
      /\bEvanston\b/i,
    ],
  },
  {
    key: "MA",
    names: ["Massachusetts", "Boston", "Cambridge", "Somerville", "Worcester"],
    patterns: [
      /\bMA\b/,
      /\bMassachusetts\b/i,
      /\bBoston\b/i,
      /\bCambridge,?\s*MA\b/i,
      /\bSomerville,?\s*MA\b/i,
    ],
  },
  {
    key: "REMOTE_US",
    names: ["Remote - US", "US Remote", "United States Remote", "Remote (US)", "Anywhere in US"],
    patterns: [
      /\bRemote\s*[-–—]\s*US\b/i,
      /\bUS\s*[-–—]\s*Remote\b/i,
      /\bRemote\s*\(\s*US(?:A)?\s*\)/i,
      /\bRemote\s*in\s*the\s*US(?:A)?\b/i,
      /\bUnited States\s*[-–—]\s*Remote\b/i,
      /\bRemote,?\s*United States\b/i,
      /\bAnywhere in (?:the )?US(?:A)?\b/i,
      /\bUS\s+Nationwide\b/i,
      /\bWork from Anywhere\s*\(\s*US\s*\)/i,
    ],
  },
  {
    key: "EU_AI_ACT",
    names: ["European Union", "EU", "Germany", "France", "Netherlands", "Ireland", "Spain", "Italy"],
    patterns: [
      /\bEU\b/,
      /\bEuropean Union\b/i,
      /\bGermany\b/i,
      /\bBerlin\b/i,
      /\bFrance\b/i,
      /\bParis\b/i,
      /\bNetherlands\b/i,
      /\bAmsterdam\b/i,
      /\bIreland\b/i,
      /\bDublin\b/i,
      /\bSpain\b/i,
      /\bMadrid\b/i,
    ],
  },
];

export function detectJurisdictions(location: string, title?: string, fullText?: string): JurisdictionMatch {
  const haystack = `${location || ""} ${title || ""} ${fullText ? fullText.slice(0, 1000) : ""}`.trim();
  const matchedKeys = new Set<string>();
  const detectedTokens: string[] = [];

  for (const rule of JURISDICTION_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(haystack)) {
        matchedKeys.add(rule.key);
        detectedTokens.push(rule.key);
        break;
      }
    }
  }

  // If location simply says "Remote" or "Worldwide" or "Anywhere" with no country restriction,
  // in US corporate contexts that typically includes US applicants.
  const isGenericRemote = /\b(?:Remote|Virtual|Telecommute|Distributed|Anywhere)\b/i.test(location || "");
  const hasNonUsCountry = /\b(?:Canada|UK|United Kingdom|India|Australia|Germany|Brazil|Japan)\b/i.test(location || "");

  if (isGenericRemote && !hasNonUsCountry && !matchedKeys.has("REMOTE_US")) {
    matchedKeys.add("REMOTE_US");
    detectedTokens.push("REMOTE_US (Inferred)");
  }

  // If REMOTE_US is detected, position is exposed to multiple key transparency states
  if (matchedKeys.has("REMOTE_US")) {
    // Add CA, NY, CO, WA, IL as affected
    matchedKeys.add("CA");
    matchedKeys.add("NY");
    matchedKeys.add("CO");
    matchedKeys.add("WA");
    matchedKeys.add("IL");
  }

  const jurisdictions = Array.from(matchedKeys);
  const isRegulated = jurisdictions.some((j) => ["CA", "NY", "CO", "WA", "IL", "MA", "REMOTE_US", "EU_AI_ACT"].includes(j));

  return {
    jurisdictions,
    isRegulated,
    detectedTokens,
  };
}
