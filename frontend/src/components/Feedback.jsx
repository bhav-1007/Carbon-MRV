export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p>;
}

export function EmptyState({ children = "No records yet." }) {
  return <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">{children}</p>;
}
