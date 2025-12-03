// backend/src/mcp/tools/apiTool.ts
import fetch from "node-fetch";
import logger from "../../config/logger";

const DEFAULT_ALLOWLIST = [
  "api.github.com",
  // add allowed hostnames or domains here
];

export default function ApiToolFactory({ tenantId }: { tenantId: string; }) {
  return {
    description: "Call external REST APIs with tenant-level allowlist",
    async handler(params: { url: string; method?: string; body?: any }, ctx: any) {
      const { url, method = "GET", body = null } = params;
      if (!url) return { error: "url required" };

      try {
        const parsed = new URL(url);
        const host = parsed.hostname;

        // allowlist check
        if (!DEFAULT_ALLOWLIST.includes(host)) {
          return { error: "Host not allowed" };
        }

        const resp = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await resp.json();
          return { status: resp.status, body: json };
        }

        const text = await resp.text();
        return { status: resp.status, body: text };
      } catch (err: any) {
        logger.error({ err, tenantId }, "API tool call failed");
        return { error: "API call failed" };
      }
    }
  };
}
