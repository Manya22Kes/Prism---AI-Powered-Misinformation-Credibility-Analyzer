const responseTemplate = {
  // ── 1. Document Context (Single source for metadata & 1-sentence summary) ─
  articleContext: {
    title: "",
    publisher: "",
    contentType: "Research Reporting", // Research Reporting | Opinion | News Reporting | Satire | Blog
    primaryTopic: "Science",
    authorStance: "Supportive", // Supportive | Neutral | Critical
    oneSentenceSummary: "" // Single 1-sentence overview of what the article is about
  },

  // ── 2. Claim Investigations (The Primary Data Array) ─────────────────────
  claimInvestigations: [
    {
      claimId: "C1",
      theme: "Methodology & Corroboration",
      topic: "Child Memory Verification",
      claimText: "DOPS researchers document verified cases of child past-life memories matching historical records.",
      importance: "Major",
      category: "Science",
      verdict: "Partially Supported", // Verified | Corroborated | Partially Supported | Contested | Unsupported | Contradicted
      confidenceScore: 75,
      shortAssessment: "presents documented case studies with historical verification, but findings remain scientifically disputed.",
      whyPrismThinksThis: {
        trustBullets: [
          "Field investigations documented birthmarks and matching historical records",
          "Conducting research within an academic division at University of Virginia"
        ],
        cautionBullets: [
          "Lack of double-blind experimental controls prior to family contact",
          "Absence of mainstream scientific replication outside DOPS"
        ]
      },
      evidenceFromArticle: [
        {
          type: "Case Study",
          subject: "Ryan Hammons — Oklahoma",
          text: "Ryan identified 55 specific details about a 1930s Hollywood extra later confirmed by an archivist.",
          interpretation: "Demonstrates empirical corroboration of specific claimed memories."
        }
      ],
      evidenceAgainstClaim: [
        {
          type: "Expert Opinion",
          subject: "Mainstream Psychology",
          text: "Cryptomnesia, parental suggestion, and memory distortion cannot be ruled out without controlled baseline trials.",
          interpretation: "Provides conventional psychological explanation for memory reports."
        }
      ],
      dataGaps: [
        "No prospective double-blind recording of statements prior to investigator involvement"
      ],
      logicalFlaws: [
        "Anecdotal Generalization",
        "Confirmation Bias"
      ],
      scientificConsensus: "Contested"
    }
  ],

  // ── 3. Source & Framing Signals ──────────────────────────────────────────
  signals: {
    primarySourcesCount: 2,
    citationsCount: 5,
    peerReviewedCount: 0
  },

  // ── 4. Source Intelligence ───────────────────────────────────────────────
  sourceIntelligence: {
    publisher: "Skeptic", // Publisher or "Not established from available content."
    author: "Identified", // Name, "Identified", "Anonymous", or "Not established from available content."
    publicationDate: "2026", // Date or "Not established from available content."
    sourceType: "Science / Editorial", // "Science / Editorial", "News Report", "Primary Research"
    primaryVsSecondary: "Secondary", // "Primary", "Secondary", "Partial", "Not established from available content."
    citationsPresent: true,
    citationsCount: 12, // Number or 0
    primarySourcesReferenced: ["Study X", "University archive"], // Array of strings or empty
    peerReviewedSources: ["Researcher A's paper"], // Array of strings or empty
    namedExperts: ["Researcher A", "Researcher B"], // Array of strings or empty
    institutionsMentioned: ["University of Virginia"], // Array of strings or empty
    reportingLevel: "Secondary analysis", // e.g. "Primary reporting", "Secondary analysis", "Opinion"
    evidenceProvenance: "Direct quotations and cited research" // Short sentence explaining where evidence comes from
  },

  // ── 5. Credibility Dimension Scores ──────────────────────────────────────
  dimensionScores: {
    evidenceQuality: {
      score: 75,
      explanation: "Relies on corroborated case studies but lacks double-blind control data."
    },
    sourceReliability: {
      score: 65,
      explanation: "Published by an academic institution but within a highly contested sub-field."
    },
    logicalConsistency: {
      score: 70,
      explanation: "Internal logic holds, but relies on the unproven premise of verifiable past lives."
    },
    scientificConsensus: {
      score: 30,
      explanation: "Strongly contested by mainstream psychology and neuroscience."
    }
  },

  // ── 6. Credibility Risks & Anomalies ────────────────────────────────────
  riskSummary: {
    status: "has_risks", // "clear" or "has_risks"
    message: "Credibility anomalies detected." // or "No significant credibility anomalies detected."
  },
  riskIndicators: [
    {
      riskType: "Unsupported Causal Inference",
      title: "Correlation presented as causation",
      severity: "HIGH", // LOW | MEDIUM | HIGH | CRITICAL
      shortExplanation: "The article claims X causes Y based only on correlated trends.",
      affectedClaimId: "C2", // Real claim ID or null
      scope: "claim", // "claim" or "article"
      evidenceQuote: "When X increased, Y increased, proving X drives Y.", // Must be verbatim from text
      whyItMatters: "Without isolating variables, the causal mechanism is unproven and potentially misleading."
    }
  ],

  // ── 7. Bias & Framing Intelligence ──────────────────────────────────────
  biasAndFraming: {
    biasLevel: 30,
    emotionalManipulationLevel: 20,
    biasIndicators: [
      {
        type: "Selective Evidence",
        severity: "MEDIUM",
        shortDescription: "Focuses exclusively on historical records that match the claim, omitting those that don't.",
        evidenceQuote: "Out of 40 cases examined, only these 2 match the records perfectly.",
        whyItMatters: "Presents a skewed probability of verification by ignoring negative results."
      }
    ],
    framingIndicators: [
      {
        type: "Authority Framing",
        severity: "HIGH",
        shortDescription: "Relies heavily on the academic affiliation to establish unquestionable truth.",
        evidenceQuote: "As researchers at the University of Virginia, our findings are beyond reproach.",
        whyItMatters: "Substitutes institutional authority for empirical evidence."
      }
    ]
  }
};

export default responseTemplate;
