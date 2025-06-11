// This `__VERSION__` constant will be replaced by tsup during the build process.
// The `declare` keyword tells TypeScript that this constant will exist at runtime.
declare const __VERSION__: string;

export const version = __VERSION__;
