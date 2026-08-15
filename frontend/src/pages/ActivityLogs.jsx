import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function ActivityLogs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "electricity", subtype: "grid", quantity: 1000, unit: "kWh", date: new Date().toISOString().slice(0, 10) });

  const load = () => api.get("/activity-logs").then((res) => setItems(res.data.items));
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api.post("/activity-logs", form);
    load();
  }

  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    await api.post("/activity-logs/upload-csv", body);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Activity Data Input</h1>
      <Panel title="Manual log">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-6">
          <select className="rounded-md border p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>electricity</option><option>transport</option><option>waste</option></select>
          <input className="rounded-md border p-2" value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })} />
          <input type="number" className="rounded-md border p-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <input className="rounded-md border p-2" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input type="date" className="rounded-md border p-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <button className="rounded-md bg-leaf px-4 py-2 text-white">Add</button>
        </form>
      </Panel>
      <Panel title="CSV bulk upload" action={<label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"><Upload size={16} /> Upload CSV<input type="file" accept=".csv" className="hidden" onChange={upload} /></label>}>
        <p className="text-sm text-slate-500">Columns: category, subtype, quantity, unit, date, departmentId.</p>
      </Panel>
      <Panel title="Recent logs">
        <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{items.map((item) => <tr key={item._id} className="border-t"><td className="py-2">{item.category}</td><td>{item.subtype}</td><td>{item.quantity} {item.unit}</td><td>{new Date(item.date).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}
