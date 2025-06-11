import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkgRaw = readFileSync(join(__dirname, "..", "package.json"), "utf8");
const pkgJson = JSON.parse(pkgRaw) as { version: string };

/** Safely run a Git command and return trimmed output or undefined. */
function git(cmd: string): string | undefined {
  try {
    return execSync(cmd).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

const version = pkgJson.version as string;
const commit  = git("git rev-parse --short HEAD") ?? "unknown";
const dirty   = git("git diff --quiet || echo dirty") ? "-dirty" : "";

const fullVersion = `${version}+${commit}${dirty}`;

const file = `/** ⚠️ AUTO-GENERATED — do not edit */
export const STAGEHAND_VERSION = "${fullVersion}" as const;
`;

writeFileSync(resolve("lib/version.ts"), file);
console.log(`🔖  STAGEHAND_VERSION → ${fullVersion}`);
