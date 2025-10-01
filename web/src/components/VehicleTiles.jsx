import { useEffect, useState } from "react";

const API = "http://localhost:8080";

export default function VehicleTiles({ selectedId, onSelect }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API}/api/vehicles/summary`)
      .then(r => r.json())
      .then(setRows)
      .catch(e => setErr(e.message));
  }, []);

  return (
    <div className="sidebar">
      {err && <div className="alert alert-warning">Tiles error: {err}</div>}
      {rows.map(v => {
        const title = [
          v.plate ? `Plate: ${v.plate}` : null,
          v.odometer!=null ? `Odometer: ${(v.odometer/1609.344).toFixed(0)} mi` : null,
          v.regDue ? `Reg Due: ${new Date(v.regDue).toLocaleDateString()}` : null
        ].filter(Boolean).join(" • ");
        return (
          <div
            key={v.id}
            className="tile"
            title={title}
            onClick={() => onSelect(v.id)}
            style={{ borderColor: selectedId===v.id ? "#60a5fa" : undefined }}
          >
            <div className="left">
              <span className={`dot ${v.status||"unknown"}`} />
              <div>
                <div>{v.name}</div>
                <div className="small">{v.driverName || "No driver"}</div>
              </div>
            </div>
            {/* right side could show a tiny badge */}
          </div>
        );
      })}
      {!rows.length && !err && <div className="small">No vehicles.</div>}
    </div>
  );
}
