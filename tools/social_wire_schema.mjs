// Minimal dependency-free validator for contracts/social-battle-api-v1.schema.json.
// Supports exactly the JSON Schema keywords that file uses; any other keyword throws, so the
// schema cannot silently grow beyond what is checked.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SCHEMA_PATH = path.join(ROOT, "contracts", "social-battle-api-v1.schema.json");
export const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

const KNOWN = new Set(["$schema", "$id", "title", "description", "$defs", "$ref", "type", "required", "properties",
  "additionalProperties", "enum", "const", "pattern", "minLength", "maxLength", "minimum", "items", "minItems",
  "maxItems", "if", "then", "else", "not", "anyOf"]);

const typeOk = (t, v) => t === "object" ? v !== null && typeof v === "object" && !Array.isArray(v)
  : t === "array" ? Array.isArray(v)
  : t === "integer" ? Number.isInteger(v)
  : typeof v === t;

function check(s, v, at, errors) {
  for (const k of Object.keys(s)) if (!KNOWN.has(k)) throw Error("unsupported schema keyword " + k);
  if (s.$ref) return check(s.$ref.split("/").slice(1).reduce((o, k) => o[k], schema), v, at, errors);
  const before = errors.length;
  if (s.type && !typeOk(s.type, v)) { errors.push(at + ": expected " + s.type); return; }
  if (s.const !== undefined && v !== s.const) errors.push(at + ": expected const " + JSON.stringify(s.const));
  if (s.enum && !s.enum.includes(v)) errors.push(at + ": not in enum " + JSON.stringify(v));
  if (typeof v === "string") {
    const len = Array.from(v).length;
    if (s.pattern && !new RegExp(s.pattern).test(v)) errors.push(at + ": pattern");
    if (s.minLength !== undefined && len < s.minLength) errors.push(at + ": too short");
    if (s.maxLength !== undefined && len > s.maxLength) errors.push(at + ": too long");
  }
  if (typeof v === "number" && s.minimum !== undefined && v < s.minimum) errors.push(at + ": below minimum");
  if (Array.isArray(v)) {
    if (s.minItems !== undefined && v.length < s.minItems) errors.push(at + ": too few items");
    if (s.maxItems !== undefined && v.length > s.maxItems) errors.push(at + ": too many items");
    if (s.items) v.forEach((item, i) => check(s.items, item, at + "[" + i + "]", errors));
  }
  if (typeOk("object", v)) {
    for (const r of s.required || []) if (!(r in v)) errors.push(at + ": missing " + r);
    for (const [k, val] of Object.entries(v)) {
      if (s.properties && s.properties[k]) check(s.properties[k], val, at + "." + k, errors);
      else if (s.additionalProperties === false) errors.push(at + ": unexpected field " + k);
    }
  }
  if (s.anyOf && !s.anyOf.some((sub) => { const e = []; check(sub, v, at, e); return !e.length; })) errors.push(at + ": anyOf");
  if (s.not) { const e = []; check(s.not, v, at, e); if (!e.length) errors.push(at + ": matches forbidden shape"); }
  if (s.if) {
    const e = []; check(s.if, v, at, e);
    const branch = e.length ? s.else : s.then;
    if (branch) check(branch, v, at, errors);
  }
  return errors.length === before;
}

export function validate(defName, value) {
  if (!schema.$defs[defName]) throw Error("unknown definition " + defName);
  const errors = [];
  check({ $ref: "#/$defs/" + defName }, value, defName, errors);
  return errors;
}

export function assertValid(defName, value) {
  const errors = validate(defName, value);
  if (errors.length) throw Error(errors.slice(0, 8).join("; "));
}
