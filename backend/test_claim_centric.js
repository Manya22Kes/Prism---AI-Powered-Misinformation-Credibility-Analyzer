async function testClaimCentricPipeline() {
  console.log("🔍 Testing v4.0 Claim-Centric Data Architecture...");
  const res = await fetch("http://localhost:5000/api/v1/analyze/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://www.skeptic.com/article/reincarnation-science-what-research-says/" })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        console.log("Stage Event:", event.stage, event.message || event.reportId || "");
        if (event.stage === "complete" && event.reportId) {
          console.log("Fetching finalized report ID:", event.reportId);
          const repRes = await fetch(`http://localhost:5000/api/v1/history/report/${event.reportId}`);
          const repData = await repRes.json();
          const report = repData.data || repData;
          const analysis = report.analysis || {};

          console.log("\n==========================================");
          console.log("✅ CLAIM-CENTRIC INVESTIGATION ENGINE OUTPUT");
          console.log("==========================================");
          console.log("ARTICLE CONTEXT:", analysis.articleContext);
          console.log("DERIVED OVERALL VERDICT:", analysis.overallVerdict);
          console.log("DERIVED CREDIBILITY SCORE:", analysis.credibility?.score, "%");
          console.log("INVESTIGATED CLAIMS COUNT:", analysis.claimInvestigations?.length);

          if (analysis.claimInvestigations?.length > 0) {
            console.log("\nSAMPLE INVESTIGATED CLAIM 1:");
            console.log("Claim Text:", analysis.claimInvestigations[0].claimText);
            console.log("Verdict:", analysis.claimInvestigations[0].verdict);
            console.log("Confidence:", analysis.claimInvestigations[0].confidenceScore, "%");
            console.log("Short Assessment:", analysis.claimInvestigations[0].shortAssessment);
            console.log("Why Prism Thinks This (Trust Bullets):", analysis.claimInvestigations[0].whyPrismThinksThis?.trustBullets);
            console.log("Why Prism Thinks This (Caution Bullets):", analysis.claimInvestigations[0].whyPrismThinksThis?.cautionBullets);
          }

          console.log("\nDERIVED TRUST DRIVERS:", analysis.executiveBriefing?.trustDrivers);
          console.log("DERIVED CAUTION DRIVERS:", analysis.executiveBriefing?.cautiousDrivers);
          console.log("DERIVED RISKS:", analysis.riskIndicators?.map(r => r.title));
          console.log("==========================================\n");
        }
      }
    }
  }
}

testClaimCentricPipeline().catch(console.error);
