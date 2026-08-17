import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function Leaderboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/leaderboard").then((res) => setItems(res.data.items)).catch((err) => setError(getApiErrorMessage(err, "Could not load leaderboard"))); }, []);
  return (
    <Panel title="Department leaderboard">
      <ErrorMessage message={error} />
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.departmentId || item.rank} className="flex items-center justify-between py-3">
            <div><p className="font-medium">#{item.rank} {item.departmentName}</p><p className="text-sm text-slate-500">{item.badge}</p></div>
            <p className="font-semibold">{item.tCO2e} tCO2e</p>
          </div>
        ))}
      </div>
      {!items.length && !error && <EmptyState>No department rankings yet.</EmptyState>}
    </Panel>
  );
}
