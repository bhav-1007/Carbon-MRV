import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function AdminEmissionFactors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "electricity", subtype: "grid", region: "IN", value: 0.716, unit: "kgCO2e/kWh", source: "Admin", effectiveFrom: "2026-01-01", version: "2026.1" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const res = await api.get("/emission-factors");
      setItems(res.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load emission factors"));
    }
  };
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.post("/emission-factors", form);
      setNotice("Emission factor saved.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save emission factor"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <ErrorMessage message={error} />
      {notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <Panel title="Add emission factor">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <select className="rounded-md border p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>electricity</option><option>transport</option><option>waste</option></select>
          {["subtype", "region", "unit", "source", "effectiveFrom", "version"].map((key) => <input key={key} className="rounded-md border p-2" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
          <input type="number" step="0.001" className="rounded-md border p-2" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <button disabled={saving} className="rounded-md bg-leaf px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
        </form>
      </Panel>
      <Panel title="Versioned factors">
        {items.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{items.map((item) => <tr key={item._id} className="border-t"><td className="py-2">{item.category}</td><td>{item.subtype}</td><td>{item.value}</td><td>{item.unit}</td><td>{item.version}</td></tr>)}</tbody></table></div> : <EmptyState>No emission factors configured.</EmptyState>}
      </Panel>
    </div>
  );
}
