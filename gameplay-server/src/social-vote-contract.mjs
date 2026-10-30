export const TEXT_NORMALIZATION_VERSION = "chat01-unicode-words-v1";

/** Deterministic Chat01 comparison: punctuation is ignored, whitespace separates words, and symbols/emoji remain meaningful. */
export function canonicalWordSignature(value) {
  if (typeof value !== "string") throw new TypeError("authored text must be a string");
  const normalized = value.normalize("NFKC").toLowerCase().replace(/\p{P}/gu, "");
  const tokens = normalized.match(/[\p{L}\p{M}\p{N}]+|\p{Extended_Pictographic}(?:\uFE0F|\p{M}|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic})*|\p{S}/gu) || [];
  return JSON.stringify(tokens);
}

function normalizeAuthoredText(value) {
  return canonicalWordSignature(String(value ?? ""));
}

/** Pure Chat05A trigger contract. Not wired to an HTTP route. */
export function shouldOpenSocialVote({
  mechanicalResult,
  previousAuthoredText,
  nextAuthoredText,
  // Missing or unrecognized provenance is untrusted. Only a server-owned
  // authored-text write may trigger this path.
  nextTextOrigin = "unknown",
}) {
  if (String(mechanicalResult ?? "").toUpperCase() === "DRAW") return true;
  if (nextTextOrigin !== "authored") return false;
  return normalizeAuthoredText(previousAuthoredText) !== normalizeAuthoredText(nextAuthoredText);
}

/** One vote per battle; persistence must enforce a unique insert on this ID. */
export async function deriveSocialVoteId(battleId) {
  if (typeof battleId !== "string" || !battleId.trim()) {
    throw new TypeError("battleId must be a non-empty string");
  }
  const input = new TextEncoder().encode("asynchronia:chat05a:social-vote:v1:" + battleId.trim());
  const digest = await crypto.subtle.digest("SHA-256", input);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return "sv1_" + hex;
}
