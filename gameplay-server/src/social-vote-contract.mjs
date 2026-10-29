const READY_PHRASE = "Готовая фраза";

function normalizeAuthoredText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/[\p{P}\p{S}\p{Z}\p{C}]/gu, "");
}

/** Pure Chat05A trigger contract. Not wired to an HTTP route. */
export function shouldOpenSocialVote({
  mechanicalResult,
  previousAuthoredText,
  nextAuthoredText,
  readyPhrase = READY_PHRASE,
}) {
  if (mechanicalResult === "draw") return true;
  const next = String(nextAuthoredText ?? "").normalize("NFKC").trim();
  if (next === String(readyPhrase).normalize("NFKC").trim()) return false;
  return normalizeAuthoredText(previousAuthoredText) !== normalizeAuthoredText(next);
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
