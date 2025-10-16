import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VehicleTiles from "../components/VehicleTiles.jsx";
import EmployeesPanel from "../components/EmployeesPanel.jsx";
import VehicleDetail from "./VehicleDetail.jsx";
import Drivers from "./Drivers.jsx";

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  // When you select in the sidebar, push the route:
  const handleSelect = (id) => {
    setSelected(id);
    navigate(`/vehicles/${encodeURIComponent(id)}`);
  };

  // If URL already has an ID, keep it as selected:
  useEffect(() => {
    const m = pathname.match(/\/vehicles\/(.+)/);
    if (m) setSelected(decodeURIComponent(m[1]));
  }, [pathname]);

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center mb-3">
        <svg
          width="60"
          height="60"
          viewBox="0 0 120 120"
          role="img"
          aria-label="Aero Logo"
          className="me-3 flex-shrink-0"
        >
          <defs>
            <linearGradient id="aeroGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect width="120" height="120" rx="24" fill="url(#aeroGradient)" />
          <path
            d="M30 74l18-44c1.4-3.5 4.1-5.6 7.8-5.6 3.9 0 6.4 1.9 7.8 5.6l7.5 19.7h19.5c4.5 0 7.4 3.3 7.4 7.4 0 3.9-2.7 7.4-7.4 7.4H68.4l4.7 12.4c0.6 1.5 0.9 3 0.9 4.4 0 5.1-3.6 8.8-8.6 8.8-4 0-6.8-2.1-8.4-5.8L46 74H34.4c-4.5 0-7.4-3.3-7.4-7.4 0-3.8 2.5-6.7 6.3-7.4"
            fill="#f8fafc"
          />
        </svg>
        <h1 className="mb-0">Aero Fleet Dashboard</h1>
      </div>

      <nav className="mb-3">
        <Link className={`me-3 ${pathname.includes("/vehicles") ? "fw-bold" : ""}`} to="/vehicles">Vehicles</Link>
        <Link className={`${pathname.includes("/drivers") ? "fw-bold" : ""}`} to="/drivers">Drivers</Link>
      </nav>

      <div className="layout">
        <VehicleTiles selectedId={selected} onSelect={handleSelect} />
        <div>
          {/* Middle: your existing routes */}
          <Routes>
            <Route index element={<Navigate to="vehicles" replace />} />
            <Route path="vehicles" element={<div className="small text-muted">Select a vehicle on the left.</div>} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route path="drivers" element={<Drivers />} />
          </Routes>
        </div>
        <EmployeesPanel vehicleId={selected} />
      </div>
    </div>
  );
}
