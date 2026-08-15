import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@sih.local", password: "Password123" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mint p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Carbon MRV Login</h1>
        <p className="mt-1 text-sm text-slate-500">Use seeded credentials after running the seed script.</p>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-5 block text-sm">Email<input className="mt-1 w-full rounded-md border p-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="mt-3 block text-sm">Password<input type="password" className="mt-1 w-full rounded-md border p-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="mt-5 w-full rounded-md bg-leaf px-4 py-2 font-medium text-white">Login</button>
        <Link to="/register" className="mt-4 block text-center text-sm text-leaf">Create organization</Link>
      </form>
    </main>
  );
}
