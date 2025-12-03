import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">
          <Link href="/"><a>MCP Cloud</a></Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/"><a className="text-sm">Home</a></Link>
          <Link href="/dashboard"><a className="text-sm">Dashboard</a></Link>
          <Link href="/admin"><a className="text-sm">Admin</a></Link>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm px-3 py-1 border rounded"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/api/auth/signin"><a className="text-sm px-3 py-1 border rounded">Sign in</a></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
