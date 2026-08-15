import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function Recommendations() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/recommendations").then((res) => setItems(res.data.items));
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const res = await api.post("/recommendations/generate");
    setItems(res.data.items);
  }

  return (
    <div className="space-y-6">
      <Panel title="ROI-ranked recommendations" action={<button onClick={generate} className="rounded-md bg-leaf px-3 py-2 text-sm text-white">Generate</button>}>
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item._id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.description}</p></div>
                <span className="rounded-md bg-mint px-2 py-1 text-sm text-leaf">{item.priorityScore}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{item.estimatedReductionTCO2e.toFixed(2)} tCO2e reduction · ₹{Math.round(item.estimatedCost).toLocaleString()} · {item.paybackPeriod} yr payback</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
