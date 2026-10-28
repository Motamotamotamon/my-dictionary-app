// These are original learning glosses. ritual checked against Cambridge's
// English/Japanese entry and pronunciation page (2026-10-28).
const verified: Record<string, { jp: string; phonetic: string }> = {
  ritual: { jp: "儀式・決まった習慣（名詞）／儀式の（形容詞）", phonetic: "/ˈrɪtʃuəl/" },
};
export function displayGloss(word: string) {
  return Object.prototype.hasOwnProperty.call(verified, word.toLowerCase()) ? verified[word.toLowerCase()] : undefined;
}
export function ipaFromTags(tags: unknown): string | undefined {
  if (!Array.isArray(tags)) return;
  // ipa=1 returns ipa_pron separately; pron remains ARPAbet.
  const value = tags.find(tag => typeof tag === "string" && tag.startsWith("ipa_pron:"))?.slice(9).trim();
  return value ? `/${value.replace(/^\/+|\/+$/g, "")}/` : undefined;
}
