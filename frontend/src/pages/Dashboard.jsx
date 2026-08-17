import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { scopeLabel } from "../utils/scopeLabels";

export function Dashboard() {
  const [data, setData] = useState({ byPeriod: [], byDepartment: [], byScope: [] });
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/emissions/dashboard").then((res) => setData(res.data)).catch((err) => setError(getApiErrorMessage(err, "Could not load dashboard")));
    api.post("/emissions/forecast").then((res) => setForecast(res.data)).catch(() => {});
  }, []);

  const total = useMemo(() => data.byPeriod.reduce((sum, item) => sum + item.total, 0), [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Institution Emissions Dashboard</h1>
        <p className="text-sm text-slate-500">Direct fuel, purchased electricity, and indirect emissions from audited activity logs.</p>
      </div>
      <ErrorMessage message={error} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total emissions" value={`${total.toFixed(2)} tCO2e`} />
        <StatCard label="Next forecast" value={`${forecast?.nextPeriodTCO2e ?? "—"} tCO2e`} hint={forecast?.method} />
        {data.byScope.map((item) => <StatCard key={item._id} label={scopeLabel(item._id)} value={`${item.total.toFixed(2)} tCO2e`} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Monthly emissions">
          {data.byPeriod.length ? <div className="h-80"><ResponsiveContainer><LineChart data={data.byPeriod}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Legend /><Line name="Total emissions" dataKey="total" stroke="#27745f" strokeWidth={2} /><Line name="Direct fuel" dataKey="scope1" stroke="#f5b84b" /><Line name="Purchased electricity" dataKey="scope2" stroke="#3267b1" /><Line name="Indirect emissions" dataKey="scope3" stroke="#a8553b" /></LineChart></ResponsiveContainer></div> : <EmptyState>Add activity data to populate the dashboard.</EmptyState>}
        </Panel>
        <Panel title="Department footprint">
          {data.byDepartment.length ? <div className="h-80"><ResponsiveContainer><BarChart data={data.byDepartment}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" hide /><YAxis /><Tooltip /><Bar dataKey="total" fill="#27745f" /></BarChart></ResponsiveContainer></div> : <EmptyState>No department emissions yet.</EmptyState>}
        </Panel>
      </div>
    </div>
  );
}
