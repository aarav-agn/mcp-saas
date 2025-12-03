import Layout from "../../components/Layout";
import Link from "next/link";

export default function BillingSuccess() {
  return (
    <Layout>
      <div className="bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold">Billing Completed</h2>
        <p className="mt-4 text-slate-600">Thank you — subscription was created successfully. In production, your webhook will connect and update your tenant subscription status.</p>
        <div className="mt-4">
          <Link href="/dashboard"><a className="px-4 py-2 bg-indigo-600 text-white rounded">Go to Dashboard</a></Link>
        </div>
      </div>
    </Layout>
  );
}
