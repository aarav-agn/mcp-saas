import { useSession, signIn } from "next-auth/react";
import Layout from "../components/Layout";
import useSWR from "swr";
import axios from "axios";
import Link from "next/link";

const fetcher = (url, token) => axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.data);

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">You need an account to access your dashboard.</p>
          <div className="mt-4">
            <button onClick={() => signIn("credentials")} className="px-4 py-2 bg-indigo-600 text-white rounded">Sign in</button>
          </div>
        </div>
      </Layout>
    );
  }

  const token = session.accessToken;

  const { data, error, mutate } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/admin/tenants`, token] : null,
    fetcher
  );

  return (
    <Layout>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Tenants</h2>
          {!data && <p>Loading...</p>}
          {data && data.tenants.length === 0 && <p>No tenants yet.</p>}
          {data && data.tenants.map(t => (
            <div key={t.id} className="mt-3 p-3 border rounded">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-slate-500">ID: {t.id}</div>
              <Link href={`/tools/sql?tenant=${t.id}`}><a className="text-indigo-600 text-sm">Open SQL runner</a></Link>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Billing</h2>
          <p className="text-sm text-slate-600 mt-2">Manage subscription and usage.</p>
          <div className="mt-4">
            <Link href="/billing/success"><a className="px-4 py-2 border rounded">Billing Demo</a></Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
