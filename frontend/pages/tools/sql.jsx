import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";

export default function SqlRunnerPage() {
  const router = useRouter();
  const { tenant } = router.query;
  const [query, setQuery] = useState("SELECT 1 AS test");
  const [result, setResult] = useState(null);
  const { data: session } = useSession();

  async function run() {
    if (!tenant) return alert("tenant id required");
    const token = session?.accessToken;
    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/mcp/${tenant}/run_sql`, { query }, { headers: { Authorization: `Bearer ${token}` }});
      setResult(resp.data);
    } catch (err) {
      console.error(err);
      setResult({ error: err?.response?.data || err.message });
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">SQL Runner — Tenant {tenant}</h2>
        <textarea value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full h-40 p-2 border rounded" />
        <div className="mt-4">
          <button onClick={run} className="bg-indigo-600 text-white px-4 py-2 rounded">Run</button>
        </div>

        {result && (
          <div className="mt-6 bg-slate-50 p-4 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
