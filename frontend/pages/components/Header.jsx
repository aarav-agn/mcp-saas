import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="w-full border-b p-4 bg-white shadow-sm flex justify-between">
      <div className="text-xl font-bold">MCP Cloud</div>
      <nav className="flex items-center gap-4">
        <Link href="/"><a>Home</a></Link>
        <Link href="/dashboard"><a>Dashboard</a></Link>
        <Link href="/admin"><a>Admin</a></Link>
        {session ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{session.user?.email}</span>
            <button onClick={() => signOut()} className="px-3 py-1 border rounded">Sign out</button>
          </div>
        ) : (
          <Link href="/auth/signin"><a className="px-3 py-1 border rounded">Sign in</a></Link>
        )}
      </nav>
    </header>
  );
}
