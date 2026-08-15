import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function Reports() {
  const [period, setPeriod] = useState("2026-01");
  const [items, setItems] = useState([]);
  const load = () => api.get("/reports").then((res) => setItems(res.data.items));
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    await api.post("/reports", { period });
    load();
  }

  return (
    <Panel title="PDF reports" action={<div className="flex gap-2"><input className="rounded-md border px-2 py-1 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)} /><button onClick={generate} className="rounded-md bg-leaf px-3 py-2 text-sm text-white">Generate</button></div>}>
      <div className="divide-y">
        {items.map((item) => <a key={item._id} className="block py-3 text-leaf" href={`http://localhost:5000${item.generatedFileUrl}`} target="_blank" rel="noreferrer">{item.period} report</a>)}
      </div>
    </Panel>
  );
}
