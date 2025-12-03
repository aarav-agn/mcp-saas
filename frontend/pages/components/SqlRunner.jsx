import { useState } from "react";

export default function SqlRunner({ run }) {
  const [query, setQuery] = useState("SELECT 1 AS test");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      const res = await run(query);
      setResult(res);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <textarea className="w-full h-36 p-2 border rounded" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <button onClick={handleRun} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {loading ? "Running..." : "Run"}
        </button>
      </div>
      {result && <div className="mt-4 bg-slate-50 p-3 rounded"><pre>{JSON.stringify(result, null, 2)}</pre></div>}
    </div>
  );
}
