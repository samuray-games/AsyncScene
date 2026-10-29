function normalizeAuthoredText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/\s+/gu, " ")
    .replace(/\p{P}/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
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
