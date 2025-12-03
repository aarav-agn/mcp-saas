// This file is an optional stub so next.js route exists for the trpc client.
// You should replace this with a real adapter that proxies to your backend trpc endpoint
import { createProxyMiddleware } from "http-proxy-middleware";

export default async function handler(req, res) {
  // Proxy requests to backend trpc if configured
  const target = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace("/api/trpc", "/api/trpc"),
  });
  return proxy(req, res, (err) => {
    res.status(500).json({ error: "proxy failed", details: String(err) });
  });
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};
