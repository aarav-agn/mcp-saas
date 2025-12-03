// Lightweight tRPC client stub. Backend must expose /api/trpc for this to work.
// If you don't plan to use tRPC yet, keep this file as a placeholder.

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export function createClient(session) {
  const headers = session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
  const client = createTRPCProxyClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/trpc`,
        headers: () => headers
      })
    ]
  });
  return client;
}
