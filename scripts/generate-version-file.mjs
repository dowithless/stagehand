/* eslint-env node */
/* eslint-disable no-empty */

import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");   // package root

await fs.mkdir(path.join(root, "lib"), { recursive: true });

const pkg = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);

let branch = "";
let sha = "";

try {
  branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root })
    .toString()
    .trim();
  sha = execSync("git rev-parse --short HEAD", { cwd: root })
    .toString()
    .trim();
} catch {}

if (!sha) {
  sha =
    process.env.npm_config_git_head ||
    process.env.npm_package_gitHead ||
    (typeof pkg.gitHead === "string" ? pkg.gitHead.slice(0, 7) : "");
}
if (!branch) {
  branch =
    process.env.npm_config_git_committish ||   // branch / tag
    process.env.npm_config_git_tag ||          // tag
    "";
}

let fullVersion = pkg.version;
if (sha && branch && branch !== "HEAD") {
  fullVersion = `${pkg.version}-${branch}@${sha}`;
} else if (sha) {
  fullVersion = `${pkg.version}@${sha}`;
} else if (branch && branch !== "HEAD") {
  fullVersion = `${pkg.version}-${branch}`;
}

const out = `/**
 * Auto-generated – DO NOT EDIT.
 */
export const STAGEHAND_VERSION = "${fullVersion}" as const;
`;

await fs.writeFile(path.join(root, "lib", "version.ts"), out, "utf8");
console.log(`[stagehand] wrote lib/version.ts → ${fullVersion}`);
