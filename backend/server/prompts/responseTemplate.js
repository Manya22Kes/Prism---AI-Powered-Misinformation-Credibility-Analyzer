const responseTemplate = {
  overallVerdict: {
    label: "Proceed With Caution",
    explanation: "",
  },

  credibility: {
    score: 75,
    explanation: "",
  },

  bias: {
    score: 30,
    explanation: "",
    detectedBiases: [
      {
        type: "Selection Bias",
        severity: "Low",
        confidenceScore: 82,
        explanation: "",
        evidence: [
          {
            text: "",
          },
        ],
      },
    ],
  },

  emotionalManipulation: {
    score: 20,
    explanation: "",
    detectedTechniques: [
      {
        technique: "Fear Appeal",
        severity: "Low",
        confidenceScore: 74,
        explanation: "",
        evidence: [
          {
            text: "",
          },
        ],
      },
    ],
  },

  claims: [
    {
      text: "",
      confidenceScore: 90,
      needsVerification: true,
      importance: "Moderate",
      category: "Science",
      evidence: [
        {
          text: "",
        },
      ],
    },
  ],

  riskIndicators: [
    {
      title: "",
      severity: "Low",
      confidenceScore: 75,
      explanation: "",
      recommendation: "",
      evidence: [
        {
          text: "",
        },
      ],
    },
  ],

  summary: "",

  recommendations: [""],
};

export default responseTemplate;
