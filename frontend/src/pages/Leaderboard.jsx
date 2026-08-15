import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function Leaderboard() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/leaderboard").then((res) => setItems(res.data.items)); }, []);
  return (
    <Panel title="Department leaderboard">
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.departmentId || item.rank} className="flex items-center justify-between py-3">
            <div><p className="font-medium">#{item.rank} {item.departmentName}</p><p className="text-sm text-slate-500">{item.badge}</p></div>
            <p className="font-semibold">{item.tCO2e} tCO2e</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
