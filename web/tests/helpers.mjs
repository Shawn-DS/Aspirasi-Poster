import { build } from "esbuild";

// Bundle a TypeScript source module in memory so Node can import it directly.
export async function importSource(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node" });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
