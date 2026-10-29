export const demoSignals = [
  {
    brand: "San Martin Watch",
    person: "Brand team",
    brandUrl: "https://sanmartin-watch.com/",
    sourceUrl: "https://sanmartin-watch.com/blog/detail/official-statement-regarding-unauthorized-counterfeit-san-martin-websites",
    sourceDate: "2026-10-09",
    sourceType: "Brand's own website",
    issue: "The brand published an advisory about an unauthorized website impersonating it.",
    evidence: "first_party",
    channel: "clone_site",
    status: "unknown",
    relationship: "unknown",
    notes: "Verify whether the fake site is still active and whether the brand already has a protection provider."
  },
  {
    brand: "Onlewo",
    person: "Brand team",
    brandUrl: "https://www.onlewo.com/",
    sourceUrl: "https://www.findglocal.com/SG/Singapore/643280595772614/Onlewo---%E5%AE%89%E4%B9%90%E7%AA%9D",
    sourceDate: "2026-08-07",
    sourceType: "Reposted brand notice",
    issue: "A brand notice names several domains it says are impersonating its store.",
    evidence: "repost",
    channel: "clone_site",
    status: "unknown",
    relationship: "unknown",
    notes: "Find the original brand notice and check whether enforcement is already complete."
  },
  {
    brand: "By Valenti Organics",
    person: "Manuela Valenti",
    brandUrl: "https://www.byvalenti.com/",
    sourceUrl: "https://fr.byvalenti.com/blogs/bibliotheca/our-website-was-cloned",
    sourceDate: "2024-02-24",
    sourceType: "Founder's brand blog",
    issue: "The founder wrote that the brand's site had been cloned and customers could be misled.",
    evidence: "first_party",
    channel: "clone_site",
    status: "unknown",
    relationship: "unknown",
    notes: "Old report. Do not treat as a current reason to contact without rechecking."
  },
  {
    brand: "Meke Baby",
    person: "Elysia Krstevski",
    brandUrl: "",
    sourceUrl: "https://www.linkedin.com/posts/nathbush_you-cant-copy-my-brain-its-never-activity-7494898594878111744-jPba",
    sourceDate: "",
    sourceType: "Founder interview shared by host",
    issue: "The founder described a competitor copying the website, product and ad copy.",
    evidence: "interview",
    channel: "creative_copy",
    status: "chose_other_route",
    relationship: "unknown",
    notes: "She said she stopped the legal process and focused on creative differentiation. Qualify gently before outreach."
  },
  {
    brand: "House of Zelena",
    person: "Hina Priyadarshini",
    brandUrl: "",
    sourceUrl: "https://www.linkedin.com/posts/hina-priyadarshini-03283713_houseofzelena-cybersafe-cybersecurity-activity-7453437775724511232-Jn29",
    sourceDate: "",
    sourceType: "Founder post",
    issue: "The founder reported a near-identical clone website.",
    evidence: "first_party",
    channel: "clone_site",
    status: "resolved",
    relationship: "unknown",
    notes: "The thread says a security provider took the site down. Exclude from urgent outreach."
  },
  {
    brand: "Brand not identified",
    person: "@rhhbrg",
    brandUrl: "",
    sourceUrl: "https://x.com/rhhbrg/status/2097697626007433717",
    sourceDate: "2026-10-27",
    sourceType: "Founder X post",
    issue: "The poster says multiple Shopify stores cloned their brand and DMCA notices have not resolved it.",
    evidence: "first_party",
    channel: "clone_site",
    status: "open",
    relationship: "already_engaged",
    notes: "Oliver replied publicly. Do not duplicate outreach; this should route to the owner of that conversation. Revenue is self-reported, not verified."
  }
];

export function scoreSignal(s) {
  const reasons = [];
  let score = 0;
  if (s.evidence === 'first_party') { score += 35; reasons.push('First-party report'); }
  else if (s.evidence === 'interview') { score += 22; reasons.push('Founder interview'); }
  else if (s.evidence === 'repost') { score += 12; reasons.push('Reposted notice; find original'); }
  if (s.channel === 'clone_site') { score += 25; reasons.push('Clone-site problem fits Bustem'); }
  else if (s.channel === 'counterfeit') { score += 25; reasons.push('Counterfeit problem fits Bustem'); }
  else if (s.channel === 'creative_copy') { score += 12; reasons.push('Creative copying may fit'); }
  if (s.brandUrl) { score += 10; reasons.push('Brand URL available'); }
  if (s.sourceDate) {
    const days = Math.floor((new Date() - new Date(`${s.sourceDate}T00:00:00Z`)) / 86400000);
    if (days >= 0 && days <= 30) { score += 20; reasons.push('Reported within 30 days'); }
    else if (days <= 90) { score += 10; reasons.push('Reported within 90 days'); }
    else { reasons.push('Older report; recheck current status'); }
  }
  score = Math.max(0, Math.min(100, score));
  let lane = score >= 65 ? 'Review now' : 'Research first';
  if (s.status === 'resolved' || s.status === 'chose_other_route') {
    lane = 'Do not pitch yet';
    reasons.push(s.status === 'resolved' ? 'Reported resolved' : 'Founder chose another route');
  }
  if (s.sourceDate && Math.floor((new Date() - new Date(`${s.sourceDate}T00:00:00Z`)) / 86400000) > 90 && lane === 'Review now') {
    lane = 'Research first';
  }
  if (s.relationship === 'already_engaged' || s.relationship === 'customer') {
    lane = 'Route internally';
    reasons.push('Existing Bustem relationship');
  }
  if (!s.sourceUrl) { lane = 'Research first'; reasons.push('Missing source'); }
  return { score, lane, reasons };
}
