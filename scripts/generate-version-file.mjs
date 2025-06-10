/* eslint-env node */
/* eslint-disable no-empty */

import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, ".."); // package root

await fs.mkdir(path.join(root, "lib"), { recursive: true });

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));

let branch = "";
let sha = "";

try {
  branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root })
    .toString()
    .trim();
  sha = execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
} catch {}

if (!sha && typeof pkg.gitHead === "string") {
  sha = pkg.gitHead.slice(0, 7);
}

if (!sha) {
  sha =
    process.env.npm_config_git_head || process.env.npm_package_gitHead || "";
}
if (!branch) {
  branch =
    process.env.npm_config_git_committish ||
    process.env.npm_config_git_tag ||
    "";
}

const fullVersion =
  sha && branch && branch !== "HEAD"
    ? `${pkg.version}-${branch}@${sha}`
    : sha
      ? `${pkg.version}@${sha}`
      : pkg.version;

const out = `/**
 * Auto-generated at build-time – DO NOT EDIT.
 * Always import via \`import { STAGEHAND_VERSION } from "./version.js"\`
 */
export const STAGEHAND_VERSION = "${fullVersion}" as const;
`;

await fs.writeFile(path.join(root, "lib", "version.ts"), out, "utf8");
console.log(`[stagehand] wrote lib/version.ts → ${fullVersion}`);
