import vinext from "vinext";
import { defineConfig } from "vite";
import cloudflareConfig from "./cloudflare.json";

export default defineConfig(async () => {
  // Keep Wrangler quiet and its state inside the project.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          name: cloudflareConfig.workerName,
          main: "./worker.ts",
          compatibility_flags: ["nodejs_compat"],
          d1_databases: [{
            binding: "DB",
            database_name: cloudflareConfig.d1DatabaseName,
            database_id: cloudflareConfig.d1DatabaseId,
          }],
        },
      }),
    ],
  };
});
