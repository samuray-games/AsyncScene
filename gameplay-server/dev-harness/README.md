# Chat03 two-player local harness

This is a development-only browser client for the already implemented Chat03 private gameplay API. It is deliberately pinned to `http://127.0.0.1:8787`; it rejects remote API addresses and does not change the Stage 7.15 entry point.

The page cannot create battles. A separate local Node script reads the admin capability from the ignored `.dev.vars` file and calls the local Worker server-to-server. The script prints one synthetic battle ID and two distinct participant tokens to the terminal. Never put the admin token in browser code, browser storage, a URL, a command-line argument, or a hosted page.

## One-time local setup

From the repository root:

```sh
cp gameplay-server/.dev.vars.example gameplay-server/.dev.vars
```

Replace both placeholder values with independent random base64url strings. Generate suitable values with:

```sh
node -e "const c=require('node:crypto'); console.log('ADMIN_CONTROL_TOKEN='+c.randomBytes(32).toString('base64url')); console.log('RECOVERY_KEY='+c.randomBytes(32).toString('base64url'))"
```

Put the first value after `ADMIN_CONTROL_TOKEN=` and use the second as the value for the `local-v1` entry in `CREATE_RECOVERY_KEYS`. The real `.dev.vars` file is ignored by Git.

Install the local Wrangler command if it is not already available:

```sh
cd gameplay-server
npm install --no-save --package-lock=false wrangler@4
```

## Run a synthetic match

Use three terminals, all from the repository root.

1. Start the Worker with local D1 only. The origin and commit window are explicit local development settings:

   ```sh
   cd gameplay-server
   npx wrangler dev --config wrangler.api-local-test.jsonc --local --ip 127.0.0.1 --port 8787 --var ALLOWED_ORIGIN:http://127.0.0.1:4173 --var COMMIT_WINDOW_MS:3600000
   ```

2. Serve the static page on loopback:

   ```sh
   python3 -m http.server 4173 --directory gameplay-server/dev-harness --bind 127.0.0.1
   ```

3. Create one local synthetic battle. From the repository root:

   ```sh
   node gameplay-server/dev-harness/create_local_battle.mjs
   ```

   The script prints the battle ID and the separate A/B player tokens. It always calls the fixed loopback Worker address; it has no remote-host option.

Open `http://127.0.0.1:4173` in two **separate private profiles or browser contexts**, select A in one and B in the other, and enter the same battle ID with that side's own token. Choose a move and commit in each page. Refresh either page to see the server state and the revealed result after both players commit.

Two private tabs in one browser may share cookies or origin storage. This harness does not use either, but separate private profiles or separate browsers are the safer way to keep the two participant contexts distinct. The player tokens are bearer credentials: do not share them, include them in screenshots, or use them with a hosted game. Closing the page or pressing **Clear this page** drops its in-memory token; reconnect by entering it again.

## Boundaries

- Local Worker + local D1 only. No hosted Worker, Cloudflare account, remote D1, public deployment, or production endpoint.
- No Stage 7.15 boot wiring, game files, shared telemetry, analytics, cookies, or persistent browser storage.
- No admin token in browser code or browser requests. Battle bootstrap is server-to-server from the local Node process.
- The UI currently creates citizen-role synthetic players and omits mafia-only black color.
- This exercises the existing API contract locally. It is not remote gameplay, private-alpha identity acceptance, Safari acceptance, or production security approval.

Run the focused safety checks with:

```sh
node --test gameplay-server/test/two_player_harness.test.mjs
```
