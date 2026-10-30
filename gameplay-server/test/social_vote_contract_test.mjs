import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalWordSignature,
  TEXT_NORMALIZATION_VERSION,
} from "../src/social-vote-contract.mjs";
import {
  deriveSocialVoteId,
  shouldOpenSocialVote,
} from "../src/social-vote-contract.mjs";

test("canonical DRAW mechanical outcome triggers a social vote", () => {
  assert.equal(shouldOpenSocialVote({ mechanicalResult: "DRAW" }), true);
});

test("substantive authored-text edit triggers a vote", () => {
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    nextTextOrigin: "authored",
    previousAuthoredText: "Защищаю свою позицию",
    nextAuthoredText: "Защищаю позицию фактами",
  }), true);
});

test("punctuation-only and whitespace-only edits do not trigger a vote", () => {
  for (const nextAuthoredText of ["Это факт...", "это факт", "a\nb", "a\tb"]) {
    const previousAuthoredText = nextAuthoredText.startsWith("Это")
      ? "Это факт!"
      : nextAuthoredText.startsWith("a")
        ? "a b"
        : "это   факт";
    assert.equal(shouldOpenSocialVote({
      mechanicalResult: "A_WIN",
      nextTextOrigin: "authored",
      previousAuthoredText,
      nextAuthoredText,
    }), false);
  }
});

test("word boundaries and emoji sequences remain semantically significant", () => {
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    nextTextOrigin: "authored",
    previousAuthoredText: "ab",
    nextAuthoredText: "a b",
  }), true);
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    nextTextOrigin: "authored",
    previousAuthoredText: "Да 👍",
    nextAuthoredText: "Да 👎",
  }), true);
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    nextTextOrigin: "authored",
    previousAuthoredText: "👩‍⚕️",
    nextAuthoredText: "👩⚕️",
  }), true);
});

test("generated and unknown text provenance cannot trigger authored-text votes", () => {
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "Черновик",
    nextAuthoredText: "↻ готовая фраза",
    nextTextOrigin: "generated_ready_phrase",
  }), false);
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "Черновик",
    nextAuthoredText: "Готовая фраза",
    nextTextOrigin: "authored",
  }), true);
  for (const nextTextOrigin of [undefined, "unknown", "generated_ready_phrase", "browser_claimed_authored"]) {
    assert.equal(shouldOpenSocialVote({
      mechanicalResult: "A_WIN",
      previousAuthoredText: "Черновик",
      nextAuthoredText: "Поддельный авторский текст",
      ...(nextTextOrigin === undefined ? {} : { nextTextOrigin }),
    }), false);
  }
});

test("vote ID is stable across reload-like calls and concurrent retries", async () => {
  const afterReload = await deriveSocialVoteId("battle-123");
  const retries = await Promise.all(Array.from({ length: 20 }, () => deriveSocialVoteId("battle-123")));
  assert.ok(retries.every((id) => id === afterReload));
});

test("different battles receive different stable vote IDs", async () => {
  assert.notEqual(
    await deriveSocialVoteId("battle-123"),
    await deriveSocialVoteId("battle-456"),
  );
});

test("invalid battle IDs fail closed", async () => {
  await assert.rejects(() => deriveSocialVoteId("  "), TypeError);
  await assert.rejects(() => deriveSocialVoteId(null), TypeError);
});


test("versioned Unicode signatures ignore case, punctuation, and whitespace but preserve word and symbol changes", () => {
  assert.equal(TEXT_NORMALIZATION_VERSION, "chat01-unicode-words-ucd-15.0.0-v2");
  assert.equal(canonicalWordSignature("ЁЖ,\t привет!"), canonicalWordSignature("ёж привет"));
  assert.equal(canonicalWordSignature("Σ"), canonicalWordSignature("ς"));
  assert.equal(canonicalWordSignature("ΟΣ"), canonicalWordSignature("οσ"));
  assert.equal(canonicalWordSignature("Straße"), canonicalWordSignature("STRASSE"));
  assert.equal(canonicalWordSignature("a-b"), canonicalWordSignature("ab"));
  assert.equal(canonicalWordSignature("ab"), canonicalWordSignature("a--b!!!"));
  assert.notEqual(canonicalWordSignature("ab"), canonicalWordSignature("a b"));
  assert.equal(canonicalWordSignature("👍 👍"), canonicalWordSignature("👍👍"));
  assert.notEqual(canonicalWordSignature("мама"), canonicalWordSignature("мыла"));
  assert.notEqual(canonicalWordSignature("слово 👍"), canonicalWordSignature("слово 👎"));
  assert.notEqual(canonicalWordSignature("👩‍⚕️"), canonicalWordSignature("👩⚕️"));
});
