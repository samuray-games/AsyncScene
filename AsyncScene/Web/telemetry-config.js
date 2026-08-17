// Private-friends alpha transport activation is intentionally configuration-only.
// Keep disabled until the reviewed receiver has a verified production HTTPS endpoint.
Object.defineProperty(window, "__ASYNCHRONIA_TELEMETRY_TRANSPORT__", {
  configurable: false,
  enumerable: false,
  writable: false,
  value: Object.freeze({
    enabled: true,
    mode: "private_friends_alpha",
    cohortId: "private_friends_alpha_2026_08",
    endpoint: "https://asynchronia-telemetry-private-alpha.raykhalit.workers.dev/v1/events",
    endpointOrigin: "https://asynchronia-telemetry-private-alpha.raykhalit.workers.dev",
  }),
});
