export const documentation = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      {
        id: "what-is-prism",
        title: "What is Prism?",
        content: `Prism is an AI-powered intelligence workspace designed for analyzing the credibility of digital content. It leverages advanced language models and analytical pipelines to assess text, URLs, images, and documents for factual consistency, emotional manipulation, risk indicators, and bias.

Prism operates primarily as a local application architecture, keeping your intelligence securely stored in your connected database without routing it through unnecessary third-party services (excluding the core AI provider).`
      },
      {
        id: "running-your-first-analysis",
        title: "Running your first analysis",
        content: `To run an analysis:
1. Select your desired input method (Text, URL, Image, Audio, Document) from the primary navigation.
2. Provide the content you wish to analyze.
3. Prism processes the content through its multi-modal intelligence engine.
4. Review the credibility result, score, and verdict.
5. Inspect the detailed intelligence modules (Claims, Bias, Risk).
6. Use the action bar to Save or Pin the report to your Archive.`
      },
      {
        id: "supported-input-types",
        title: "Supported input types",
        content: `Prism supports several input vectors for analysis:
- **Text**: Direct text pasting and analysis.
- **URL**: Analyzes the content hosted at a specific web address.
- **Image**: Extracts and analyzes text, context, and potential manipulation in images.
- **Document**: Analyzes structured text documents (e.g., PDFs).
- **Audio**: Extracts transcripts and analyzes spoken content.`
      },
      {
        id: "understanding-an-analysis-report",
        title: "Understanding an analysis report",
        content: `An analysis report provides a comprehensive breakdown of the submitted content. It features a top-level **Credibility Score** (0-100) and a categorical **Verdict**.

Below the primary metrics, Prism presents detailed intelligence modules:
- **Evidence & Claims**: Specific factual claims extracted and evaluated.
- **Source Intelligence**: Available signals regarding the publisher or author.
- **Risk & Anomaly Intelligence**: Indicators of synthetic generation, manipulation, or urgency.
- **Bias & Framing**: Analysis of the emotional tone and potential agenda.

*Note: AI-generated assessments are analytical estimates, not absolute truth.*`
      }
    ]
  },
  {
    id: "analysis",
    title: "Analysis",
    items: [
      {
        id: "text-analysis",
        title: "Text Analysis",
        content: `The Text Analysis module allows you to paste raw text directly into Prism. This is ideal for quickly verifying statements, excerpts, or claims without needing a source URL.`
      },
      {
        id: "url-analysis",
        title: "URL Analysis",
        content: `URL Analysis fetches the content from a provided web link. Prism analyzes the core text of the article or page while attempting to filter out navigation elements and advertisements. The effectiveness of URL analysis depends on the accessibility of the target webpage.`
      },
      {
        id: "image-analysis",
        title: "Image Analysis",
        content: `Image Analysis utilizes multi-modal intelligence to "read" images. It extracts visible text, analyzes visual context, and looks for discrepancies that might suggest manipulation or misrepresentation.`
      },
      {
        id: "document-analysis",
        title: "Document Analysis",
        content: `Document Analysis processes uploaded files (such as PDFs). Prism extracts the text content and structure, analyzing it for credibility, bias, and risk exactly like standard text inputs.`
      },
      {
        id: "audio-analysis",
        title: "Audio Analysis",
        content: `Audio Analysis extracts the transcript from uploaded audio files, analyzing the spoken content, tone, and claims made by the speakers.`
      },
      {
        id: "batch-analysis",
        title: "Batch Analysis",
        content: `Batch Analysis allows you to process multiple URLs or text snippets concurrently. The queue system handles the jobs in the background and aggregates the results into a single dashboard.`
      },
      {
        id: "credibility-scores",
        title: "Credibility Scores",
        content: `The Credibility Score is a numerical representation of the content's reliability, ranging from 0 to 100.
- **80-100**: Highly credible, well-sourced, neutral language.
- **60-79**: Generally credible, but may contain mild bias or lack some citations.
- **40-59**: Mixed credibility; contains unverified claims, strong bias, or questionable logic.
- **0-39**: Low credibility; high risk of misinformation, emotional manipulation, or synthetic generation.

*The score is an analytical assessment by the AI model, not a mathematical certainty.*`
      },
      {
        id: "verdicts",
        title: "Verdicts",
        content: `Prism categorizes content into one of several verdicts:
- **Verified**: High confidence in factual accuracy.
- **Likely True**: Generally accurate, minor discrepancies possible.
- **Mixed**: Contains both true and false/unverified elements.
- **Unverified**: Lacks sufficient evidence to confirm or deny.
- **Likely False**: High probability of inaccuracy or manipulation.
- **Debunked**: Known misinformation or demonstrably false.`
      },
      {
        id: "evidence-claims",
        title: "Evidence & Claims",
        content: `Prism extracts the core claims made in the content and evaluates them individually. Each claim is given an independent assessment and confidence level, allowing you to see exactly which parts of a text are questionable.`
      }
    ]
  },
  {
    id: "intelligence",
    title: "Intelligence",
    items: [
      {
        id: "source-intelligence",
        title: "Source Intelligence",
        content: `Prism attempts to evaluate the publisher, author, or origin of the content. This includes identifying potential biases, historical credibility issues, and domain reputation. Note that source intelligence relies heavily on the AI's internal knowledge base.`
      },
      {
        id: "risk-anomaly",
        title: "Risk & Anomaly Intelligence",
        content: `This module flags potential security or credibility risks, including:
- **Synthetic Generation**: Likelihood that the text was written by an AI.
- **Emotional Manipulation**: Use of fear-mongering, urgency, or outrage to manipulate the reader.
- **Logical Fallacies**: Identification of straw-man arguments, ad hominem attacks, or circular reasoning.`
      },
      {
        id: "bias-framing",
        title: "Bias & Framing",
        content: `Prism evaluates the political or ideological leaning of the text (e.g., Left, Right, Center, Authoritarian). It also identifies the specific framing techniques used to present the narrative, such as omitting context or appealing to emotion.`
      },
      {
        id: "environmental-context",
        title: "Environmental Context",
        content: `Prism attempts to place the content within a broader situational context, identifying if the narrative is part of a known misinformation campaign or related to ongoing, highly polarized events.`
      },
      {
        id: "reading-mode",
        title: "Reading Mode",
        content: `Reading Mode provides a distraction-free, clean layout of the analyzed content, allowing you to read the text directly alongside Prism's analytical findings.`
      }
    ]
  },
  {
    id: "organization",
    title: "Organization",
    items: [
      {
        id: "archive",
        title: "Archive",
        content: `The Archive contains a complete historical record of every analysis you have run in Prism. Reports can be revisited, deleted, or pinned directly from this view.`
      },
      {
        id: "saved-reports",
        title: "Saved Reports",
        content: `Saved Reports is a curated view of the Archive. It displays only the specific reports you have explicitly marked as "Saved", allowing you to separate important analyses from the general historical log.`
      },
      {
        id: "collections",
        title: "Collections",
        content: `Collections allow you to group related analyses together. You can create custom collections (e.g., "Election Misinformation", "Tech News") and add reports to them for organized reference.`
      },
      {
        id: "search",
        title: "Search",
        content: `The global search functionality allows you to find past analyses based on keywords, topics, or verdicts, instantly retrieving historical reports from your local database.`
      },
      {
        id: "comparison",
        title: "Comparison",
        content: `Comparison mode allows you to view two different analysis reports side-by-side. This is useful for tracking how a narrative evolves over time or comparing coverage from two different sources.`
      }
    ]
  },
  {
    id: "live-intelligence",
    title: "Live Intelligence",
    items: [
      {
        id: "watchlist",
        title: "Watchlist",
        content: `The Watchlist monitors specific URLs, Sources, or Topics over time.
- **URL Monitoring**: Re-analyzes a specific webpage to track changes in credibility or narrative over time.
- **Source/Topic Monitoring**: Currently relies on manual checks or future search integrations to aggregate data.
The Watchlist records a history of score changes and verdict shifts, allowing you to identify when a source alters its content.`
      },
      {
        id: "mission-control",
        title: "Mission Control",
        content: `Mission Control serves as your central operational dashboard. It aggregates real telemetry from your Prism instance, including total analyses processed, active watchlists, collection counts, and current system health.`
      },
      {
        id: "recent-activity",
        title: "Recent Activity",
        content: `Recent Activity provides an audit log of meaningful actions within your workspace. It records events such as completing analyses, saving/pinning reports, and watchlist updates, giving you a chronological view of your intelligence workflow.`
      }
    ]
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        id: "api-status",
        title: "API Status",
        content: `The API Status (or System Health) dashboard provides real-time visibility into the operational state of Prism's core components:
- **Prism API**: Checks if the backend server is reachable.
- **Database**: Verifies the connection to MongoDB and measures latency.
- **AI Provider**: Confirms that a valid Gemini API key is configured.
- **Analysis Engine / Batch Analysis**: Verifies that the processing queues are initialized.`
      },
      {
        id: "settings",
        title: "Settings",
        content: `The Settings workspace allows you to configure your Prism environment:
- **Appearance**: Toggle between Deep Space (dark) and Daylight (light) themes, and enable/disable Reduced Motion.
- **Automatic Refresh**: Controls the polling interval for live dashboards like Mission Control and Recent Activity.
- **Security & Privacy**: Clear your local preferences.
- **Data Sources**: View live telemetry of your connected database and AI provider.`
      },
      {
        id: "api-configuration",
        title: "API Configuration",
        content: `Prism relies on Google's Gemini multimodal intelligence engine. **For security, API keys are managed entirely through the backend server's environment variables.** Prism will never display or expose your API key in the frontend UI.`
      }
    ]
  },
  {
    id: "reference",
    title: "Reference",
    items: [
      {
        id: "verdict-meanings",
        title: "Verdict Meanings",
        content: `Verdicts are determined by the AI based on the extracted claims and overall narrative consistency:
- **Verified**: Strong corroborating evidence exists.
- **Likely True**: Minor nuances may be missing, but the core narrative is accurate.
- **Mixed**: Blends facts with significant falsehoods or misleading framing.
- **Unverified**: The AI cannot determine the truthfulness based on its training data.
- **Likely False**: The narrative contradicts established facts.
- **Debunked**: A known, prominent falsehood.`
      },
      {
        id: "score-interpretation",
        title: "Score Interpretation",
        content: `The 0-100 Credibility Score is an aggregation of multiple factors: factual accuracy, emotional neutrality, logical consistency, and source reputation. A high score means the content appears reliable; it does **not** mean Prism guarantees it is flawlessly true.`
      },
      {
        id: "known-limitations",
        title: "Known Limitations",
        content: `> [!WARNING]
> **Important Limitations**
> - **Analytical Assessment, Not Absolute Truth**: Prism's outputs are calculated estimates generated by an AI model. They are not guaranteed facts.
> - **AI Hallucinations**: Language models can sometimes generate plausible but incorrect information.
> - **Lack of Real-time Search**: Unless specifically configured with a live search integration, the AI relies on its training data cutoff, meaning it may not have context for breaking news events.
> - **URL Paywalls**: URL Analysis may fail or return inaccurate results if the target page is protected by a paywall or anti-bot challenge.
> - **Subjectivity**: Bias and framing assessments can occasionally be subjective depending on the model's internal alignment.`
      },
      {
        id: "faq",
        title: "FAQ",
        content: `**Q: What does the credibility score mean?**
A: The Credibility Score is a numerical representation of the content's reliability, ranging from 0 to 100. It aggregates factual consistency, logical coherence, and emotional neutrality.

**Q: Does a low score mean the article is definitely fake?**
A: No. A low score indicates poor reliability, heavy bias, or manipulative language. It may be factually accurate but presented in a highly deceptive or emotionally manipulative way.

**Q: Can Prism verify every claim?**
A: No. Prism can only verify claims against the knowledge embedded in its AI provider or connected search tools. Niche or highly localized claims may remain "Unverified".

**Q: Why can two analyses produce different results?**
A: AI models are non-deterministic by nature. Small changes in prompt structure or model temperature can yield slightly different assessments, particularly for borderline content.

**Q: Does Prism store my API key?**
A: No. The frontend UI does not store or access your API key. It is securely managed by your backend environment.

**Q: What happens when a watched URL changes?**
A: When you manually check or if automatic polling is enabled, Prism re-analyzes the page. Any changes in the Credibility Score or Verdict are logged in the Watchlist history.

**Q: What is the difference between Archive and Saved Reports?**
A: The Archive is an exhaustive history of every analysis you perform. Saved Reports acts as your curated bookmark list—only showing reports you explicitly clicked "Save" on.

**Q: What happens if Gemini is unavailable?**
A: Analyses cannot be processed. Prism will display an error during analysis submission, and the API Status page will indicate the AI Provider is offline or degraded.`
      }
    ]
  },
  {
    id: "support",
    title: "Support",
    items: [
      {
        id: "issue-reporting",
        title: "Support & Issue Reporting",
        content: `If you encounter bugs, connectivity issues, or unexpected analysis results while using Prism, please ensure that:
1. Your backend server is running and reachable.
2. Your MongoDB instance is connected and accessible.
3. Your Gemini API key is valid and has sufficient quota.

For further assistance, complaints, or feature requests, please consult your system administrator or refer to the internal development guidelines.`
      }
    ]
  }
];
