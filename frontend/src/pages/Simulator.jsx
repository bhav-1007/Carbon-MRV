import { useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";

export function Simulator() {
  const [form, setForm] = useState({ category: "electricity", reductionPercent: 10 });
  const [result, setResult] = useState(null);

  async function run(next = form) {
    setForm(next);
    const res = await api.post("/simulator/what-if", next);
    setResult(res.data);
  }

  return (
    <div className="space-y-6">
      <Panel title="What-if simulator">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <select className="rounded-md border p-2" value={form.category} onChange={(e) => run({ ...form, category: e.target.value })}><option>electricity</option><option>transport</option><option>waste</option></select>
          <label className="text-sm">Reduction: {form.reductionPercent}%<input type="range" min="0" max="80" value={form.reductionPercent} onChange={(e) => run({ ...form, reductionPercent: Number(e.target.value) })} className="mt-2 w-full" /></label>
        </div>
      </Panel>
      {result && <div className="grid gap-4 md:grid-cols-3"><StatCard label="Baseline" value={`${result.baselineTCO2e} tCO2e`} /><StatCard label="Projected" value={`${result.projectedTCO2e} tCO2e`} /><StatCard label="Avoided" value={`${result.deltaTCO2e} tCO2e`} /></div>}
    </div>
  );
}
