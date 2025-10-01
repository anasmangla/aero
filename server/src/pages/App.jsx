import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="container py-3">
      <h1 className="mb-3">Aero Fleet Dashboard</h1>
      <nav className="mb-4">
        <Link className={`me-3 ${pathname.startsWith("/vehicles") ? "fw-bold" : ""}`} to="/vehicles">Vehicles</Link>
        <Link className={`${pathname.startsWith("/drivers") ? "fw-bold" : ""}`} to="/drivers">Drivers</Link>
      </nav>
      <Outlet />
    </div>
  );
}
