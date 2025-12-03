import { useState } from "react";

export default function ApiRunner({ run }) {
  const [url, setUrl] = useState("https://api.github.com/");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      const parsedBody = body ? JSON.parse(body) : undefined;
      const res = await run({ url, method, body: parsedBody });
      setResult(res);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <input className="w-full p-2 border rounded mb-2" value={url} onChange={(e) => setUrl(e.target.value)} />
      <select className="p-2 border rounded mb-2" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>
      {method !== "GET" && <textarea className="w-full h-28 p-2 border rounded mb-2" value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"foo":"bar"}' />}
      <div className="flex gap-2">
        <button onClick={handleRun} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {loading ? "Calling..." : "Call API"}
        </button>
      </div>
      {result && <div className="mt-4 bg-slate-50 p-3 rounded"><pre>{JSON.stringify(result, null, 2)}</pre></div>}
    </div>
  );
}
