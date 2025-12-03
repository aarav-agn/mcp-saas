import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
