export function createSessionEpoch() {
  let epoch = 0;
  return {
    begin() { epoch += 1; return epoch; },
    invalidate() { epoch += 1; return epoch; },
    current() { return epoch; },
    isCurrent(candidate) { return candidate === epoch; },
  };
}
export function createSessionViewGate() {
  let latestVersion = -1;
  return {
    reset() { latestVersion = -1; },
    accept(view) {
      if (!Number.isSafeInteger(view?.version) || view.version < 0 || view.version < latestVersion) return false;
      latestVersion = view.version;
      return true;
    },
  };
}
