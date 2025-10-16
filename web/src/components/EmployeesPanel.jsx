import { API_BASE, getVehicleFallback } from "../config";
import { useMemo } from "react";

export default function EmployeesPanel({ vehicleId }) {
  const fallback = useMemo(() => (!API_BASE && vehicleId ? getVehicleFallback(vehicleId) : null), [vehicleId]);

  return (
    <div style={{borderLeft:"1px solid #e5e7eb", paddingLeft:12}}>
      <h5>Employees</h5>
      {fallback ? (
        <div className="small">
          <div className="fw-semibold mb-1">Assigned Driver</div>
          <div>{fallback.driverName}</div>
          <div className="mt-2">HR system is not connected in demo mode.</div>
        </div>
      ) : (
        <p className="small">Show dispatcher/driver HR info here.</p>
      )}
      {/* Later: driver profile, time off, write-ups, contact, etc. */}
    </div>
  );
}
