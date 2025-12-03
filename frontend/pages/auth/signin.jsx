import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import Layout from "../../components/Layout";

export default function SignIn({ csrfToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
          }}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <div className="mb-3">
            <label className="block text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Sign in</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

SignIn.getInitialProps = async (context) => {
  return {
    csrfToken: await getCsrfToken(context),
  };
};
