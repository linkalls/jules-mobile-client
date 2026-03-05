import { bench, run } from "mitata";

const N = 10000;
const M = 100;

// Mock sources
const sources = Array.from({ length: N }, (_, i) => ({ name: `source-${i}` }));
// Mock validRecentRepos (a subset of sources)
const validRecentRepos = Array.from({ length: M }, (_, i) => ({ name: `source-${i * 10}` }));

bench("O(N*M) Baseline (Array.includes)", () => {
  const recentNames = validRecentRepos.map(r => r.name);
  return sources.filter(s => !recentNames.includes(s.name));
});

bench("O(N) Optimized (Set.has)", () => {
  const recentNames = new Set(validRecentRepos.map(r => r.name));
  return sources.filter(s => !recentNames.has(s.name));
});

await run();
