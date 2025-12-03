export default function TenantCard({ tenant, onStart }) {
    return (
      <div className="p-3 border rounded mb-2">
        <div className="font-medium">{tenant.name}</div>
        <div className="text-sm text-slate-600">ID: {tenant.id}</div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => onStart(tenant.id)} className="px-3 py-1 border rounded text-sm">Start MCP</button>
        </div>
      </div>
    );
  }
  