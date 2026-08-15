import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Bot, FileText, Gauge, Leaf, ListPlus, Medal, Scale, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const nav = [
  ["/", "Dashboard", BarChart3],
  ["/activity", "Activity", ListPlus],
  ["/recommendations", "Recommendations", Sparkles],
  ["/simulator", "Simulator", Gauge],
  ["/benchmarking", "Benchmarking", Scale],
  ["/leaderboard", "Leaderboard", Medal],
  ["/reports", "Reports", FileText],
  ["/assistant", "Assistant", Bot],
  ["/admin/factors", "Factors", Settings]
];

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-leaf text-white"><Leaf size={20} /></div>
          <div>
            <p className="font-semibold">Carbon MRV</p>
            <p className="text-xs text-slate-500">IH-45 MVP</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? "bg-mint text-leaf" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 border-t pt-4 text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
          <button onClick={logout} className="mt-3 rounded-md border px-3 py-2 text-sm">Logout</button>
        </div>
      </aside>
      <main className="p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
