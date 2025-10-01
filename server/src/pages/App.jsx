import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../images/Aero Logo.png"; // adjust path

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="container py-3">
      <div className="d-flex align-items-center mb-3">
        <img src={logo} alt="Aero Logo" style={{ height: "60px", marginRight: "15px" }} />
        <h1 className="mb-0">Aero Fleet Dashboard</h1>
      </div>
      <nav className="mb-4">
        <Link className={`me-3 ${pathname.startsWith("/vehicles") ? "fw-bold" : ""}`} to="/vehicles">Vehicles</Link>
        <Link className={`${pathname.startsWith("/drivers") ? "fw-bold" : ""}`} to="/drivers">Drivers</Link>
      </nav>
      <Outlet />
    </div>
  );
}
