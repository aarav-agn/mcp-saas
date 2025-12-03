import Layout from "../../components/Layout";
import { useSession } from "next-auth/react";
import axios from "axios";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url, token) => axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.data);

export default function Admin() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, mutate } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/admin/tenants`, token] : null,
    fetcher
  );

  const [name, setName] = useState("");

  async function createTenant() {
    if (!name) return alert("Enter tenant name");
    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/admin/tenants`, { name }, { headers: { Authorization: `Bearer ${token}` }});
    setName("");
    mutate();
  }

  async function startTenant(id) {
    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/mcp/${id}/start`, {}, { headers: { Authorization: `Bearer ${token}` }});
    mutate();
    alert("Requested start");
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Admin — Tenants</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tenant name" className="border p-2 rounded flex-1" />
          <button onClick={createTenant} className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
        </div>
      </div>

      <div className="grid gap-4">
        {!data && <p>Loading...</p>}
        {data && data.tenants.map(t => (
          <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-slate-500">ID: {t.id}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startTenant(t.id)} className="px-3 py-1 border rounded">Start MCP</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
