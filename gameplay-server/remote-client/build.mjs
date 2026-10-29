import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateApiOrigin } from "./client.mjs";

const source = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(path.join(source, "dist"));
const origin = process.env.CHAT03_API_ORIGIN || "";
const approved = process.env.CHAT03_API_ORIGIN_APPROVED === "YES";
await rm(output, { recursive: true, force: true });
if (!approved || !validateApiOrigin(origin)) {
  console.error("BUILD_BLOCKED: supply an explicitly approved exact HTTPS API origin; no public config was generated.");
  process.exitCode = 2;
} else {
  await mkdir(output, { recursive: true });
  for (const name of ["app.mjs", "client.mjs", "style.css"]) await cp(path.join(source, name), path.join(output, name));
  let html = await readFile(path.join(source, "index.html"), "utf8");
  const connectPolicy = `default-src 'none'; base-uri 'none'; form-action 'none'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src ${origin}; object-src 'none'`;
  const sourcePolicy = "default-src 'none'; base-uri 'none'; form-action 'none'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'";
  if (!html.includes(sourcePolicy)) throw new Error("BUILD_BLOCKED: source CSP placeholder is missing");
  html = html.replace(sourcePolicy, connectPolicy);
  await writeFile(path.join(output, "index.html"), html, { mode: 0o644 });
  await writeFile(path.join(output, "config.mjs"), `export const API_ORIGIN = ${JSON.stringify(origin)};\nexport const API_ORIGIN_APPROVED = true;\n`, { mode: 0o644 });
  const headerPolicy = connectPolicy.replace("form-action 'none';", "form-action 'none'; frame-ancestors 'none';");
  await writeFile(path.join(output, "_headers"), `/*\n  Content-Security-Policy: ${headerPolicy}\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n`, { mode: 0o644 });
  console.log(`BUILD_READY: exact API origin configured for private staging review only: ${origin}`);
}
