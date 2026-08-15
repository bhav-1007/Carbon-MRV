import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ActivityLogs } from "./pages/ActivityLogs";
import { AdminEmissionFactors } from "./pages/AdminEmissionFactors";
import { Assistant } from "./pages/Assistant";
import { Benchmarking } from "./pages/Benchmarking";
import { Dashboard } from "./pages/Dashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { Login } from "./pages/Login";
import { Recommendations } from "./pages/Recommendations";
import { Register } from "./pages/Register";
import { Reports } from "./pages/Reports";
import { Simulator } from "./pages/Simulator";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/activity" element={<ActivityLogs />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/benchmarking" element={<Benchmarking />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/admin/factors" element={<AdminEmissionFactors />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
