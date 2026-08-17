import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function Recommendations() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/recommendations");
      setItems(res.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load recommendations"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setError("");
    setGenerating(true);
    try {
      const res = await api.post("/recommendations/generate");
      setItems(res.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate recommendations"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="ROI-ranked recommendations" action={<button disabled={generating} onClick={generate} className="rounded-md bg-leaf px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">{generating ? "Generating..." : "Generate"}</button>}>
        <div className="grid gap-3">
          <ErrorMessage message={error} />
          {loading && <p className="text-sm text-slate-500">Loading recommendations...</p>}
          {items.map((item) => (
            <article key={item._id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.description}</p></div>
                <span className="rounded-md bg-mint px-2 py-1 text-sm text-leaf">{item.priorityScore}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{item.estimatedReductionTCO2e.toFixed(2)} tCO2e reduction · ₹{Math.round(item.estimatedCost).toLocaleString()} · {item.paybackPeriod} yr payback</p>
            </article>
          ))}
          {!loading && !items.length && <EmptyState>Generate recommendations after adding emission data.</EmptyState>}
        </div>
      </Panel>
    </div>
  );
}
