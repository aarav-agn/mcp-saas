import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession } from "next-auth/react";
import Layout from "../../components/Layout";

export default function ApiRunnerPage() {
  const router = useRouter();
  const { tenant } = router.query;
  const [url, setUrl] = useState("https://api.github.com/");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const { data: session } = useSession();

  async function run() {
    if (!tenant) return alert("tenant id required");
    const token = session?.accessToken;
    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/mcp/${tenant}/call_api`, { url, method, body: body ? JSON.parse(body) : null }, { headers: { Authorization: `Bearer ${token}` }});
      setResult(resp.data);
    } catch (err) {
      console.error(err);
      setResult({ error: err?.response?.data || err.message });
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">API Runner — Tenant {tenant}</h2>
        <div className="mb-2">
          <input className="w-full p-2 border rounded" value={url} onChange={(e)=>setUrl(e.target.value)} />
        </div>
        <div className="mb-2">
          <select value={method} onChange={(e)=>setMethod(e.target.value)} className="p-2 border rounded">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </div>
        {method !== "GET" && <textarea className="w-full h-28 p-2 border rounded" value={body} onChange={(e)=>setBody(e.target.value)} placeholder='{"foo":"bar"}' />}
        <div className="mt-2">
          <button onClick={run} className="bg-indigo-600 text-white px-4 py-2 rounded">Call API</button>
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
