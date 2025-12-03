export default function Loading({ text = "Loading..." }) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-sm text-slate-600">{text}</div>
      </div>
    );
  }
  