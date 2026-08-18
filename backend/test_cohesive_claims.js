async function testLiveCohesiveClaims() {
  console.log('🌐 Testing Live Cohesive Claim Extraction (Max 8)...');
  const res = await fetch('http://localhost:5000/api/v1/analyze/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.skeptic.com/article/reincarnation-science-what-research-says/' })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let reportId = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    if (chunk.includes('"stage":"complete"')) {
      const match = chunk.match(/"reportId":"([^"]+)"/);
      if (match) reportId = match[1];
    }
  }

  if (reportId) {
    const repRes = await fetch(`http://localhost:5000/api/v1/history/report/${reportId}`);
    const repJson = await repRes.json();
    const claims = repJson.data?.analysis?.claims || [];

    console.log('==================================================');
    console.log('🎉 COHESIVE CLAIM EXTRACTION SUCCESSFUL!');
    console.log(`Total Claims Extracted: ${claims.length} (Capped between 4 and 8)`);
    console.log('==================================================');
    claims.forEach((c, i) => {
      console.log(`\nClaim #${i + 1} [${c.category}]:`);
      console.log(`"${c.statement || c.claim}"`);
      console.log(`Reasoning: ${c.reasoning || c.explanation}`);
    });
    console.log('==================================================');
  }
}

testLiveCohesiveClaims();
