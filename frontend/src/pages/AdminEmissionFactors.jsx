import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function AdminEmissionFactors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "electricity", subtype: "grid", region: "IN", value: 0.716, unit: "kgCO2e/kWh", source: "Admin", effectiveFrom: "2026-01-01", version: "2026.1" });
  const load = () => api.get("/emission-factors").then((res) => setItems(res.data.items));
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api.post("/emission-factors", form);
    load();
  }

  return (
    <div className="space-y-6">
      <Panel title="Add emission factor">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <select className="rounded-md border p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>electricity</option><option>transport</option><option>waste</option></select>
          {["subtype", "region", "unit", "source", "effectiveFrom", "version"].map((key) => <input key={key} className="rounded-md border p-2" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
          <input type="number" step="0.001" className="rounded-md border p-2" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <button className="rounded-md bg-leaf px-4 py-2 text-white">Save</button>
        </form>
      </Panel>
      <Panel title="Versioned factors">
        <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{items.map((item) => <tr key={item._id} className="border-t"><td className="py-2">{item.category}</td><td>{item.subtype}</td><td>{item.value}</td><td>{item.unit}</td><td>{item.version}</td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}
