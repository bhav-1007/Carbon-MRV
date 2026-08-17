import { useEffect, useState } from "react";
import { api, getApiErrorMessage, getFileUrl } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function Reports() {
  const [period, setPeriod] = useState("2026-01");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const res = await api.get("/reports");
      setItems(res.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load reports"));
    }
  };
  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.post("/reports", { period });
      setNotice("Report generated.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate report"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="PDF reports" action={<div className="flex gap-2"><input className="rounded-md border px-2 py-1 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)} /><button disabled={saving} onClick={generate} className="rounded-md bg-leaf px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Generating..." : "Generate"}</button></div>}>
      <div className="space-y-3">
        <ErrorMessage message={error} />
        {notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
        {items.length ? <div className="divide-y">
          {items.map((item) => <a key={item._id} className="block py-3 text-leaf" href={getFileUrl(item.generatedFileUrl)} target="_blank" rel="noreferrer">{item.period} report</a>)}
        </div> : <EmptyState>No reports generated yet.</EmptyState>}
      </div>
    </Panel>
  );
}
