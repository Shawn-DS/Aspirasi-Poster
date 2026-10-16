import vinext from "vinext";
import { defineConfig } from "vite";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";
import hostingConfig from "./.openai/hosting.json";
import cloudflareConfig from "./cloudflare.json";

const managedLinux = readExecutionProfile() === "managed-linux";
export default defineConfig(async () => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    server: {
      host: managedLinux ? "0.0.0.0" : "127.0.0.1",
      allowedHosts: managedLinux ? ["terminal.local"] : ["localhost", "127.0.0.1"],
    },
    plugins: [
      vinext(),
      sites({ mockAuth: false }),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          name: cloudflareConfig.workerName,
          main: "./build/sites-worker.ts", compatibility_flags: ["nodejs_compat"],
          d1_databases: hostingConfig.d1 ? [{
            binding: hostingConfig.d1,
            database_name: cloudflareConfig.d1DatabaseName,
            database_id: cloudflareConfig.d1DatabaseId,
          }] : [],
        },
      }),
    ],
  };
});
