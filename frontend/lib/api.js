import axios from "axios";

/**
 * backendFetch(session, path, opts)
 * session: NextAuth session object (session.accessToken expected)
 * path: API path starting with /api/...
 * opts: axios options (method, data, params, headers)
 */
export async function backendFetch(session, path, opts = {}) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
  const url = `${base}${path}`;
  const headers = opts.headers || {};
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  const cfg = { ...opts, headers };
  const res = await axios(url, cfg);
  return res.data;
}
