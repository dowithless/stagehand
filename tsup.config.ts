import { defineConfig } from "tsup";
import { execSync } from "child_process";
import pkg from "./package.json";
import alias from "esbuild-plugin-alias"; // <-- The new, simpler plugin

const getVersion = () => {
  if (process.env.CI) {
    return pkg.version;
  }
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim();
    return `${pkg.version}-dev+${hash}`;
  } catch (error) {
    console.warn(
      "Could not get git hash, falling back to package version.",
      error,
    );
    return `${pkg.version}-dev`;
  }
};

const version = getVersion();
console.log(`Building Stagehand with version: ${version}`);

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [/^[^./]/], // This is correct and stays

  // We define the alias directly and explicitly right here
  esbuildPlugins: [
    alias({
      // This tells esbuild to replace any import starting with "@/"
      // with a path starting from the root directory "./"
      "@": "./",
    }),
  ],

  esbuildOptions(options) {
    options.define = {
      ...options.define,
      __VERSION__: JSON.stringify(version),
    };
  },
});
