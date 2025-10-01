import { Link, Outlet, useLocation, useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
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
        <img src="/aero-logo.png" alt="Aero Logo" style={{ height: 60, marginRight: 15 }} />
        <h1 className="mb-0">Aero Fleet Dashboard</h1>
      </div>

      <nav className="mb-3">
        <Link className={`me-3 ${pathname.startsWith("/vehicles") ? "fw-bold" : ""}`} to="/vehicles">Vehicles</Link>
        <Link className={`${pathname.startsWith("/drivers") ? "fw-bold" : ""}`} to="/drivers">Drivers</Link>
      </nav>

      <div className="layout">
        <VehicleTiles selectedId={selected} onSelect={handleSelect} />
        <div>
          {/* Middle: your existing routes */}
          <Routes>
            <Route index element={<Navigate to="/vehicles" />} />
            <Route path="/vehicles" element={<div className="small text-muted">Select a vehicle on the left.</div>} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/drivers" element={<Drivers />} />
          </Routes>
        </div>
        <EmployeesPanel vehicleId={selected} />
      </div>
    </div>
  );
}
