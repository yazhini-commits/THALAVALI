export function getWordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Approximate readability (Flesch-style)
export function getReadabilityScore(text = "") {
  if (!text) return 0;

  const sentences = text.split(/[.!?]/).filter(Boolean).length || 1;
  const words = getWordCount(text) || 1;

  // Approx syllable estimation
  const syllables = words * 1.4;

  const score =
    206.835 -
    1.015 * (words / sentences) -
    84.6 * (syllables / words);

  return Math.max(0, Math.min(100, Math.round(score)));
}
