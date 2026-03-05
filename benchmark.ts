const KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|type|interface)\b/g;
const STRINGS = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
const NUMBERS = /\b\d+(\.\d+)?\b/g;
const COMMENTS = /\/\/.*|\/\*[\s\S]*?\*\//g;
const BOOLEANS = /\b(true|false|null|undefined)\b/g;

const text = `
function isPrime(num) {
  if (num <= 1) return false;
  if (num === 2) return true;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}
// check some numbers
console.log(isPrime(10));
console.log(isPrime(11));
`;

const ITERATIONS = 10000;

function benchmarkOriginal() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const matches: any[] = [];
    [
      { regex: COMMENTS, color: "comment" },
      { regex: STRINGS, color: "string" },
      { regex: KEYWORDS, color: "keyword" },
      { regex: NUMBERS, color: "number" },
      { regex: BOOLEANS, color: "boolean" },
    ].forEach(({ regex, color }) => {
      let match;
      const r = new RegExp(regex.source, regex.flags);
      while ((match = r.exec(text)) !== null) {
        matches.push({ index: match.index, length: match[0].length, color, text: match[0] });
      }
    });
  }
  return performance.now() - start;
}

function benchmarkOptimized() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const matches: any[] = [];
    [
      { regex: COMMENTS, color: "comment" },
      { regex: STRINGS, color: "string" },
      { regex: KEYWORDS, color: "keyword" },
      { regex: NUMBERS, color: "number" },
      { regex: BOOLEANS, color: "boolean" },
    ].forEach(({ regex, color }) => {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ index: match.index, length: match[0].length, color, text: match[0] });
      }
    });
  }
  return performance.now() - start;
}

console.log(`Original: ${benchmarkOriginal().toFixed(2)}ms`);
console.log(`Optimized: ${benchmarkOptimized().toFixed(2)}ms`);
