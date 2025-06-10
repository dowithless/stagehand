import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pkgPath = join(__dirname, "..", "package.json");
const pkgRaw = readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(pkgRaw) as { version: string; gitHead?: string };

let commit: string | undefined = pkg.gitHead?.slice(0, 9);
if (!commit && process.env.npm_package_gitHead) {
  commit = process.env.npm_package_gitHead.slice(0, 9);
}
if (!commit) {
  try {
    commit = execSync("git rev-parse --short=9 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {/**/}
}

const fullVersion = `${pkg.version}+${commit ?? "unknown"}` as const;

writeFileSync(
  join(__dirname, "..", "lib", "version.ts"),
  `/**
 * ⚠️  AUTO-GENERATED — DO NOT EDIT BY HAND
 * Run \`pnpm run gen-version\` to refresh.
 */
export const STAGEHAND_VERSION = "${fullVersion}" as const;
`,
);
