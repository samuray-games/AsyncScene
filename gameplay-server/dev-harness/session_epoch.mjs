export function createSessionEpoch() {
  let epoch = 0;
  return {
    begin() { epoch += 1; return epoch; },
    invalidate() { epoch += 1; return epoch; },
    current() { return epoch; },
    isCurrent(candidate) { return candidate === epoch; },
  };
}
