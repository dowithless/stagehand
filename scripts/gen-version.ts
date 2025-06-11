/* scripts/generate-version.ts */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

type Pkg = { version: string; gitHead?: string };

const pkgPath = join(__dirname, "..", "package.json");
const pkgRaw  = readFileSync(pkgPath, "utf8");
const pkg     = JSON.parse(pkgRaw) as Pkg;

console.debug("🗂️  package.json.version →", pkg.version);
console.debug("🗂️  package.json.gitHead →", pkg.gitHead);

function tryGit(cmd: string): string | undefined {
  try {
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

/* 1️⃣  env / metadata paths we’ll try in order */
const commitFromPkg = pkg.gitHead?.slice(0, 9);
const commitFromEnv = process.env.npm_package_gitHead?.slice(0, 9);
const commitFromGit = tryGit("git rev-parse --short=9 HEAD");
const dirtyFlag     = tryGit("git diff --quiet || echo dirty") ? "-dirty" : "";

/* 2️⃣  log each candidate so you know which one won */
console.debug("🔍 commitFromPkg →", commitFromPkg);
console.debug("🔍 commitFromEnv →", commitFromEnv);
console.debug("🔍 commitFromGit →", commitFromGit);

const commit = commitFromPkg ?? commitFromEnv ?? commitFromGit ?? "unknown";

const fullVersion = `${pkg.version}+${commit}${dirtyFlag}`;

const file = `/** ⚠️  AUTO-GENERATED — DO NOT EDIT */
export const STAGEHAND_VERSION = "${fullVersion}" as const;
`;

writeFileSync(resolve("lib/version.ts"), file);
console.log(`🔖  STAGEHAND_VERSION → ${fullVersion}`);