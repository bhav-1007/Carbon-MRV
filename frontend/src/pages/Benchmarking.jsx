import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function Benchmarking() {
  const [data, setData] = useState({ own: null, peers: [] });
  useEffect(() => { api.get("/benchmarks/peer-comparison").then((res) => setData(res.data)); }, []);
  const chart = [data.own, ...data.peers].filter(Boolean).map((item) => ({ name: item.name, perCapita: item.perCapitaTCO2e }));

  return (
    <Panel title="Peer per-capita benchmarking">
      <div className="h-96"><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="perCapita" fill="#27745f" /></BarChart></ResponsiveContainer></div>
    </Panel>
  );
}
