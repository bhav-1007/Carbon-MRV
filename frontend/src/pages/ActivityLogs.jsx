import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { api, getApiErrorMessage } from "../api/client";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

const subtypeOptions = {
  electricity: ["grid"],
  transport: ["diesel", "petrol", "commute_bus"],
  waste: ["landfill_mixed", "recycled_paper"]
};

export function ActivityLogs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "electricity", subtype: "grid", quantity: 1000, unit: "kWh", date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [importedRows, setImportedRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);

  const load = async (nextPage = page, nextLimit = limit) => {
    setLoading(true);
    try {
      const res = await api.get("/activity-logs", { params: { page: nextPage, limit: nextLimit } });
      setItems(res.data.items);
      setPage(res.data.page || nextPage);
      setLimit(res.data.limit || nextLimit);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load activity logs"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setUploadErrors([]);
    setImportedRows([]);
    setSaving(true);
    try {
      await api.post("/activity-logs", form);
      setNotice("Activity added and emissions calculated.");
      await load(1, limit);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add activity"));
    } finally {
      setSaving(false);
    }
  }

  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setError("");
    setNotice("");
    setUploadErrors([]);
    setImportedRows([]);
    setUploading(true);
    try {
      const res = await api.post("/activity-logs/upload-csv", body);
      const failed = res.data.failedCount || res.data.errors?.length || 0;
      setUploadErrors(res.data.errors || []);
      setImportedRows(res.data.created || []);
      setNotice(`Imported ${res.data.createdCount} row${res.data.createdCount === 1 ? "" : "s"}${failed ? `, ${failed} row${failed === 1 ? "" : "s"} failed` : ""}.`);
      await load(1, limit);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload CSV"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function updateCategory(category) {
    const subtype = subtypeOptions[category]?.[0] || "";
    setForm({ ...form, category, subtype });
  }

  function downloadTemplate() {
    const csv = [
      "department,category,subtype,quantity,unit,date",
      "Computer Science,electricity,grid,1200,kWh,2026-03-01",
      "Administration,transport,diesel,80,litre,2026-03-02",
      "Hostel A,waste,landfill_mixed,250,kg,2026-03-03"
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-upload-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function changeLimit(nextLimit) {
    load(1, nextLimit);
  }

  function changePage(nextPage) {
    if (nextPage < 1 || nextPage > pages || nextPage === page) return;
    load(nextPage, limit);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Activity Data Input</h1>
      <ErrorMessage message={error} />
      {uploading && <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">Uploading CSV and calculating emissions...</p>}
      {notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      {importedRows.length > 0 && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">Imported rows now added to activity logs</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b"><th className="py-2">Category</th><th>Subtype</th><th>Quantity</th><th>Period</th><th>Emissions</th></tr></thead>
              <tbody>{importedRows.slice(0, 5).map((row) => <tr key={row.id} className="border-b border-green-100"><td className="py-2">{row.category}</td><td>{row.subtype}</td><td>{row.quantity} {row.unit}</td><td>{row.period}</td><td>{Number(row.tCO2e).toFixed(3)} tCO2e</td></tr>)}</tbody>
            </table>
          </div>
          {importedRows.length > 5 && <p className="mt-2">Showing 5 of {importedRows.length} imported rows.</p>}
        </div>
      )}
      {uploadErrors.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Rows that were not imported</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {uploadErrors.slice(0, 8).map((item) => <li key={`${item.row}-${item.message}`}>Row {item.row}: {item.message}</li>)}
          </ul>
          {uploadErrors.length > 8 && <p className="mt-2">Showing 8 of {uploadErrors.length} failed rows.</p>}
        </div>
      )}
      <Panel title="Manual log">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-6">
          <select className="rounded-md border p-2" value={form.category} onChange={(e) => updateCategory(e.target.value)}><option>electricity</option><option>transport</option><option>waste</option></select>
          <select className="rounded-md border p-2" value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })}>{(subtypeOptions[form.category] || []).map((subtype) => <option key={subtype}>{subtype}</option>)}</select>
          <input type="number" className="rounded-md border p-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <input className="rounded-md border p-2" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input type="date" className="rounded-md border p-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <button disabled={saving} className="rounded-md bg-leaf px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Add"}</button>
        </form>
      </Panel>
      <Panel title="CSV bulk upload" action={<div className="flex flex-wrap gap-2"><button type="button" onClick={downloadTemplate} className="rounded-md border px-3 py-2 text-sm">Template</button><label className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><Upload size={16} /> {uploading ? "Uploading..." : "Upload CSV"}<input disabled={uploading} type="file" accept=".csv" className="hidden" onChange={upload} /></label></div>}>
        <p className="text-sm text-slate-500">Columns: department, category, subtype, quantity, unit, date. Department can be a name such as Computer Science, Administration, or Hostel A.</p>
      </Panel>
      <Panel title={`Recent logs${total ? ` (${total} total)` : ""}`} action={<div className="flex items-center gap-2 text-sm"><span className="text-slate-500">Rows</span><select className="rounded-md border px-2 py-1" value={limit} onChange={(event) => changeLimit(Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></div>}>
        {loading ? <p className="text-sm text-slate-500">Loading activity logs...</p> : items.length ? (
          <div className="space-y-4">
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-2">Category</th><th>Subtype</th><th>Quantity</th><th>Date</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t"><td className="py-2">{item.category}</td><td>{item.subtype}</td><td>{item.quantity} {item.unit}</td><td>{new Date(item.date).toLocaleDateString()}</td></tr>)}</tbody></table></div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-500">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)} className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <button type="button" disabled={page >= pages || loading} onClick={() => changePage(page + 1)} className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        ) : <EmptyState>Add activity data to calculate emissions.</EmptyState>}
      </Panel>
    </div>
  );
}
