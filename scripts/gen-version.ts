import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8"),
) as { version: string };

let commit: string | undefined;
try {
  commit = execSync("git rev-parse --short=9 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch { /* ignored */ }

if (!commit && process.env.npm_package_gitHead) {
  commit = process.env.npm_package_gitHead.slice(0, 9);
}

const fullVersion = `${pkg.version}+${commit ?? "unknown"}` as const;

writeFileSync(
  join(__dirname, "..", "lib", "version.ts"),
  `// AUTO-GENERATED – do not edit\nexport const STAGEHAND_VERSION = "${fullVersion}" as const;\n`,
);
