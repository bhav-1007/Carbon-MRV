import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function Benchmarking() {
  const [data, setData] = useState({ own: null, peers: [] });
  const [error, setError] = useState("");
  useEffect(() => { api.get("/benchmarks/peer-comparison").then((res) => setData(res.data)).catch((err) => setError(getApiErrorMessage(err, "Could not load benchmarking data"))); }, []);
  const chart = [data.own, ...data.peers].filter(Boolean).map((item) => ({ name: item.name, perCapita: item.perCapitaTCO2e }));

  return (
    <Panel title="Peer per-capita benchmarking">
      <div className="space-y-3">
        <ErrorMessage message={error} />
        {chart.length ? <div className="h-96"><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="perCapita" fill="#27745f" /></BarChart></ResponsiveContainer></div> : <EmptyState>No benchmarking data available.</EmptyState>}
      </div>
    </Panel>
  );
}
