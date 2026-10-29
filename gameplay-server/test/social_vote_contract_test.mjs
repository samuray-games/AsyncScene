import test from "node:test";
import assert from "node:assert/strict";
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
    previousAuthoredText: "Защищаю свою позицию",
    nextAuthoredText: "Защищаю позицию фактами",
  }), true);
});

test("punctuation-only and whitespace-only edits do not trigger a vote", () => {
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "Это факт!",
    nextAuthoredText: "Это факт...",
  }), false);
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "это   факт",
    nextAuthoredText: "это факт",
  }), false);
});

test("whitespace and emoji content remain semantically significant", () => {
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "ab",
    nextAuthoredText: "a b",
  }), true);
  assert.equal(shouldOpenSocialVote({
    mechanicalResult: "A_WIN",
    previousAuthoredText: "Да 👍",
    nextAuthoredText: "Да 👎",
  }), true);
});

test("trusted generated ready phrase changes do not trigger authored-text votes", () => {
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
