const testCases = [
  {
    id: "reliable-science-001",
    category: "Reliable scientific news",
    title: "Peer-reviewed climate attribution study",
    input:
      "A peer-reviewed study published in Nature Climate Change reports that rising ocean temperatures have increased the intensity of recent marine heatwaves. The researchers analyzed satellite temperature records from 1982 to 2023 and compared them with climate model simulations. The authors said natural variability still affects individual events, but long-term warming has made extreme ocean temperatures more frequent.",
    expected: {
      overallVerdict: "Highly Reliable",
      acceptableVerdicts: ["Highly Reliable", "Generally Reliable"],
      credibilityRange: [85, 100],
      manipulationRange: [0, 20],
      biasRange: [0, 20],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "reuters-style-001",
    category: "Reuters/AP style reporting",
    title: "Central bank leaves rates unchanged",
    input:
      "The central bank left its benchmark interest rate unchanged on Wednesday, citing slower inflation and steady labor market conditions. In a statement after the meeting, policymakers said future decisions would depend on incoming economic data. Analysts surveyed before the announcement had widely expected no rate change.",
    expected: {
      overallVerdict: "Generally Reliable",
      acceptableVerdicts: ["Generally Reliable", "Highly Reliable"],
      credibilityRange: [75, 95],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "who-announcement-001",
    category: "WHO announcements",
    title: "WHO vaccine safety update",
    input:
      "The World Health Organization said its vaccine safety committee reviewed recent monitoring data and found that serious adverse events remain rare. The agency recommended that countries continue routine immunization programs and report suspected side effects through established surveillance systems.",
    expected: {
      overallVerdict: "Highly Reliable",
      acceptableVerdicts: ["Highly Reliable", "Generally Reliable"],
      credibilityRange: [85, 100],
      manipulationRange: [0, 15],
      biasRange: [0, 15],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "fake-news-001",
    category: "Fake news",
    title: "Fabricated celebrity arrest claim",
    input:
      "Breaking: A famous actor was secretly arrested last night after police found a hidden laboratory under his house, according to unnamed insiders. Mainstream outlets are refusing to report the story because powerful executives are protecting him. Share this before it disappears.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 35],
      manipulationRange: [60, 100],
      biasRange: [35, 85],
      expectedRiskIndicators: ["unnamed", "share", "conspiracy"],
    },
  },
  {
    id: "debunked-misinfo-001",
    category: "Debunked misinformation",
    title: "False election machine rumor",
    input:
      "Election machines in several states were connected to foreign satellites and changed millions of votes, according to a viral post. The post provides no documents, names no election officials, and says courts are hiding the evidence from the public.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 30],
      manipulationRange: [55, 95],
      biasRange: [50, 90],
      expectedRiskIndicators: ["viral", "no documents", "hiding"],
    },
  },
  {
    id: "medical-misinfo-001",
    category: "Medical misinformation",
    title: "Miracle cancer cure",
    input:
      "Doctors do not want you to know that drinking concentrated apricot seed extract cures cancer in 10 days. Chemotherapy is a scam, and this natural treatment works for every patient without side effects. Buy the protocol now before hospitals get it banned.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 20],
      manipulationRange: [75, 100],
      biasRange: [60, 100],
      expectedRiskIndicators: ["medical", "cure", "buy"],
    },
  },
  {
    id: "health-claim-001",
    category: "Health claims",
    title: "Moderate caffeine claim",
    input:
      "Several observational studies have found an association between moderate coffee consumption and a lower risk of some health conditions. Researchers caution that these studies do not prove coffee directly causes better health outcomes, and individual tolerance to caffeine varies.",
    expected: {
      overallVerdict: "Generally Reliable",
      acceptableVerdicts: ["Generally Reliable", "Proceed With Caution"],
      credibilityRange: [70, 90],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "political-opinion-001",
    category: "Political opinion",
    title: "Opinion column on tax policy",
    input:
      "The mayor's tax plan is a terrible idea because it will make the city less competitive. Supporters say the revenue will fund schools, but I believe voters should reject it and demand spending cuts instead.",
    expected: {
      overallVerdict: "Proceed With Caution",
      credibilityRange: [45, 75],
      manipulationRange: [15, 45],
      biasRange: [45, 85],
      expectedRiskIndicators: ["opinion", "bias"],
    },
  },
  {
    id: "political-reporting-001",
    category: "Political reporting",
    title: "Legislature passes budget bill",
    input:
      "The state legislature passed a $42 billion budget bill on Friday after three weeks of debate. The bill increases education spending by 4 percent and creates a new housing grant program. The governor said she plans to sign the measure next week.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [75, 95],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "satire-001",
    category: "Satire",
    title: "Satirical moon announcement",
    input:
      "In a historic press conference, the Department of Weather announced it will move the moon three feet to the left to improve weekend sunsets. Officials said the project will be funded by selling premium clouds to billionaires.",
    expected: {
      overallVerdict: "Questionable",
      acceptableVerdicts: ["Questionable", "Proceed With Caution"],
      credibilityRange: [10, 45],
      manipulationRange: [10, 45],
      biasRange: [0, 35],
      expectedRiskIndicators: ["satire", "implausible"],
    },
  },
  {
    id: "clickbait-001",
    category: "Clickbait",
    title: "Shocking food claim",
    input:
      "You will not believe what this common breakfast food is doing to your body. Experts are stunned, grocery stores are panicking, and the truth will change your life forever. Number seven is the one doctors hate.",
    expected: {
      overallVerdict: "Questionable",
      acceptableVerdicts: ["Questionable", "Proceed With Caution"],
      credibilityRange: [20, 50],
      manipulationRange: [65, 100],
      biasRange: [30, 75],
      expectedRiskIndicators: ["clickbait", "sensational"],
    },
  },
  {
    id: "advertisement-001",
    category: "Advertisement",
    title: "Supplement marketing copy",
    input:
      "Our premium focus supplement supports mental clarity with a proprietary blend of botanical extracts. Thousands of customers say they feel more productive after using it. Order today and get 40 percent off your first bottle.",
    expected: {
      overallVerdict: "Proceed With Caution",
      acceptableVerdicts: ["Proceed With Caution", "Questionable"],
      credibilityRange: [35, 65],
      manipulationRange: [35, 75],
      biasRange: [50, 90],
      expectedRiskIndicators: ["advertisement", "proprietary", "order"],
    },
  },
  {
    id: "financial-scam-001",
    category: "Financial scams",
    title: "Guaranteed investment returns",
    input:
      "This private trading group guarantees 20 percent returns every month with zero risk. Members only need to send an initial deposit today to unlock the strategy. Banks do not want ordinary people to access this wealth system.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 25],
      manipulationRange: [75, 100],
      biasRange: [55, 95],
      expectedRiskIndicators: ["guarantees", "deposit", "zero risk"],
    },
  },
  {
    id: "crypto-scam-001",
    category: "Cryptocurrency scams",
    title: "Celebrity crypto giveaway",
    input:
      "A verified-looking account claims that a billionaire is giving away cryptocurrency to celebrate a product launch. Users are told to send 0.1 ETH to a wallet address and will receive 1 ETH back within minutes. The post urges readers to act before the offer expires.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 20],
      manipulationRange: [80, 100],
      biasRange: [45, 85],
      expectedRiskIndicators: ["cryptocurrency", "wallet", "act"],
    },
  },
  {
    id: "ai-generated-001",
    category: "AI-generated articles",
    title: "Generic AI article about productivity",
    input:
      "Productivity is important in the modern world because people want to do more in less time. Many experts agree that planning, focus, and consistency can help individuals achieve their goals. In conclusion, productivity remains a key factor for success.",
    expected: {
      overallVerdict: "Proceed With Caution",
      credibilityRange: [45, 75],
      manipulationRange: [0, 25],
      biasRange: [0, 30],
      expectedRiskIndicators: ["generic", "limited evidence"],
    },
  },
  {
    id: "blog-post-001",
    category: "Blog posts",
    title: "Personal remote work blog",
    input:
      "After working remotely for two years, I think small teams benefit from written updates and fewer meetings. A 2023 survey by Buffer found that many remote workers value flexibility, although experiences differ by company and role.",
    expected: {
      overallVerdict: "Proceed With Caution",
      acceptableVerdicts: ["Proceed With Caution", "Generally Reliable"],
      credibilityRange: [55, 80],
      manipulationRange: [0, 25],
      biasRange: [25, 60],
      expectedRiskIndicators: ["personal", "limited"],
    },
  },
  {
    id: "wikipedia-style-001",
    category: "Wikipedia-style text",
    title: "Volcano encyclopedia entry",
    input:
      "Mount Vesuvius is a stratovolcano located near Naples, Italy. It is best known for the eruption in AD 79 that buried Pompeii and Herculaneum. The volcano remains active and is monitored because of the dense population nearby.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [75, 95],
      manipulationRange: [0, 15],
      biasRange: [0, 15],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "social-media-001",
    category: "Social media posts",
    title: "Viral school closure rumor",
    input:
      "My cousin heard all schools in the county are closing next week because of a secret safety threat. Officials are not telling parents yet, but everyone should keep their kids home and repost this warning.",
    expected: {
      overallVerdict: "Questionable",
      credibilityRange: [15, 45],
      manipulationRange: [60, 95],
      biasRange: [25, 65],
      expectedRiskIndicators: ["heard", "secret", "repost"],
    },
  },
  {
    id: "climate-claim-001",
    category: "Climate claims",
    title: "Misleading cold weather claim",
    input:
      "It snowed in one city this week, so global warming is obviously fake. Climate scientists have been lying for decades to get more grant money.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 30],
      manipulationRange: [55, 90],
      biasRange: [65, 100],
      expectedRiskIndicators: ["climate", "single event", "conspiracy"],
    },
  },
  {
    id: "crime-reporting-001",
    category: "Crime reporting",
    title: "Police identify suspect",
    input:
      "Police said a 32-year-old man was arrested Tuesday in connection with a downtown robbery. Investigators said no injuries were reported and the case has been referred to prosecutors. The suspect has not entered a plea.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [70, 90],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "education-001",
    category: "Education",
    title: "District reading scores",
    input:
      "The school district reported that third-grade reading proficiency increased from 48 percent to 54 percent over the past year. Officials attributed the change to a new tutoring program but said attendance and staffing also affected results.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [70, 90],
      manipulationRange: [0, 20],
      biasRange: [0, 30],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "technology-001",
    category: "Technology",
    title: "Company releases security patch",
    input:
      "A software company released a security patch for a vulnerability that could allow unauthorized access to user accounts. The company said it has not found evidence of active exploitation and advised customers to install the update promptly.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [75, 95],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "entertainment-001",
    category: "Entertainment",
    title: "Film release announcement",
    input:
      "The studio announced that the sequel will open in theaters on November 14. The cast includes the original lead actors, and the director said production wrapped earlier this month. A trailer is expected later this summer.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [65, 90],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "sports-001",
    category: "Sports",
    title: "Team wins final",
    input:
      "The city football club won the championship final 2-1 after scoring in extra time. The league reported official attendance of 61,000, and the coach praised the team's defensive performance after the match.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [70, 95],
      manipulationRange: [0, 20],
      biasRange: [0, 25],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "historical-facts-001",
    category: "Historical facts",
    title: "Apollo 11 landing",
    input:
      "Apollo 11 landed on the Moon on July 20, 1969. Neil Armstrong and Buzz Aldrin walked on the lunar surface while Michael Collins remained in lunar orbit aboard the command module.",
    expected: {
      overallVerdict: "Highly Reliable",
      credibilityRange: [85, 100],
      manipulationRange: [0, 10],
      biasRange: [0, 10],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "mixed-factual-opinion-001",
    category: "Mixed factual/opinion content",
    title: "Transit expansion argument",
    input:
      "The city council voted 6-3 to approve the new light rail extension. The project is expected to cost $2.1 billion. In my view, the plan is wasteful and will only benefit downtown developers.",
    expected: {
      overallVerdict: "Proceed With Caution",
      acceptableVerdicts: ["Proceed With Caution", "Generally Reliable"],
      credibilityRange: [55, 80],
      manipulationRange: [15, 45],
      biasRange: [35, 75],
      expectedRiskIndicators: ["opinion", "mixed"],
    },
  },
  {
    id: "medical-advice-001",
    category: "Medical misinformation",
    title: "Unsafe diabetes advice",
    input:
      "People with diabetes can stop taking prescribed medication if they follow this fruit-only cleanse for two weeks. The cleanse removes toxins and resets the pancreas naturally. Doctors ignore this because they profit from prescriptions.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 20],
      manipulationRange: [75, 100],
      biasRange: [60, 100],
      expectedRiskIndicators: ["diabetes", "medication", "doctors"],
    },
  },
  {
    id: "public-safety-001",
    category: "Public safety rumor",
    title: "Unverified product recall warning",
    input:
      "A viral message says every bottle of a popular sports drink has been recalled for poison contamination. The message does not link to the company, regulators, or a recall notice, but says anyone who drank it should go to the hospital immediately.",
    expected: {
      overallVerdict: "Questionable",
      credibilityRange: [15, 45],
      manipulationRange: [60, 95],
      biasRange: [25, 65],
      expectedRiskIndicators: ["viral", "recall", "no link"],
    },
  },
  {
    id: "financial-reporting-001",
    category: "Financial reporting",
    title: "Quarterly earnings report",
    input:
      "The company reported quarterly revenue of $3.4 billion, up 8 percent from the same period last year. Net income fell because of restructuring costs, according to the earnings release. Executives said demand remained strongest in enterprise software.",
    expected: {
      overallVerdict: "Generally Reliable",
      credibilityRange: [70, 95],
      manipulationRange: [0, 20],
      biasRange: [0, 30],
      expectedRiskIndicators: [],
    },
  },
  {
    id: "conspiracy-001",
    category: "Conspiracy misinformation",
    title: "Secret weather control claim",
    input:
      "The government is using hidden antennas to create storms and control the population. Every major weather event is planned in advance, but meteorologists are paid to keep quiet. Wake up before it is too late.",
    expected: {
      overallVerdict: "Highly Unreliable",
      credibilityRange: [0, 20],
      manipulationRange: [75, 100],
      biasRange: [65, 100],
      expectedRiskIndicators: ["government", "hidden", "wake up"],
    },
  },
];

export default testCases;
