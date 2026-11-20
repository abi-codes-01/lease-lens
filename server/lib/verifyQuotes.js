function normaliseForMatch(value) {
  return value
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function verifyQuotes(flags, text) {
  const normalisedText = normaliseForMatch(text);
  const kept = flags.filter((flag) => {
    const normalisedQuote = normaliseForMatch(flag.quote);
    return normalisedQuote.length > 0 && normalisedText.includes(normalisedQuote);
  });

  const droppedCount = flags.length - kept.length;
  if (droppedCount > 0) {
    console.log(`[AI] dropped ${droppedCount} flags whose quote is not in the agreement`);
  }

  return kept;
}
