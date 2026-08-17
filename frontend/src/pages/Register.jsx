import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api/client";
import { ErrorMessage } from "../components/Feedback";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", organizationName: "", organizationType: "college" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mint p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Register Institution</h1>
        <div className="mt-4"><ErrorMessage message={error} /></div>
        {["name", "email", "password", "organizationName"].map((field) => (
          <label key={field} className="mt-4 block text-sm capitalize">
            {field.replace("organizationName", "Organization name")}
            <input type={field === "password" ? "password" : "text"} className="mt-1 w-full rounded-md border p-2" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </label>
        ))}
        <select className="mt-4 w-full rounded-md border p-2" value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}>
          <option value="college">College</option>
          <option value="hospital">Hospital</option>
          <option value="office">Office</option>
        </select>
        <button disabled={saving} className="mt-5 w-full rounded-md bg-leaf px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Registering..." : "Register"}</button>
        <Link to="/login" className="mt-4 block text-center text-sm text-leaf">Back to login</Link>
      </form>
    </main>
  );
}
