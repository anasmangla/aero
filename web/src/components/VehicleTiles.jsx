import { useEffect, useState } from "react";
import { API_BASE, FALLBACK_VEHICLES } from "../config";

export default function VehicleTiles({ selectedId, onSelect }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const normalizedSelected = selectedId != null ? String(selectedId) : null;

  useEffect(() => {
    if (!API_BASE) {
      setRows(FALLBACK_VEHICLES);
      setErr("Demo data shown because the live API is unavailable.");
      return;
    }

    fetch(`${API_BASE}/api/vehicles/summary`)
      .then(async r => {
        if (!r.ok) throw new Error(`summary ${r.status}`);
        const data = await r.json();
        setRows(Array.isArray(data) ? data : []);
      })
      .catch(e => {
        setErr(e.message);
        setRows(FALLBACK_VEHICLES);
      });
  }, []);

  return (
    <div className="sidebar">
      {err && <div className="alert alert-warning">{err}</div>}
      {rows.map(v => {
        const id = String(v.id);
        const title = [
          v.plate ? `Plate: ${v.plate}` : null,
          v.odometer!=null ? `Odometer: ${(v.odometer/1609.344).toFixed(0)} mi` : null,
          v.regDue ? `Reg Due: ${new Date(v.regDue).toLocaleDateString()}` : null
        ].filter(Boolean).join(" • ");

        return (
          <div
            key={id}
            className="tile"
            title={title}
            onClick={() => onSelect(id)}
            style={{ borderColor: normalizedSelected===id ? "#60a5fa" : undefined }}
          >
            <div className="left">
              <span className={`dot ${v.status||"unknown"}`} />
              <div>
                <div>{v.name}</div>
                <div className="small">{v.driverName || "No driver"}</div>
              </div>
            </div>
          </div>
        );
      })}
      {!rows.length && !err && <div className="small">No vehicles.</div>}
    </div>
  );
}
