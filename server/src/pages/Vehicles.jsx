import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

export default function Vehicles() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    axios.get(`${API}/api/vehicles`)
      .then(r => setRows(r.data))
      .catch(e => {
        setErr(e.message);
        // fallback to test route so you see something even if Samsara fails
        axios.get(`${API}/api/vehicles/test`).then(r => setRows(r.data)).catch(()=>{});
      });
  }, []);

  return (
    <div>
      <h4 className="mb-3">Vehicles</h4>
      {err && <div className="alert alert-warning">API error: {err}</div>}
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th style={{width: "18rem"}}>Vehicle</th>
            <th>VIN</th>
            <th>Plate</th>
            <th style={{width: "8rem"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(v => (
            <tr key={v.id}>
              <td>{v.name} <div className="text-muted small">{v.id}</div></td>
              <td>{v.vin || "-"}</td>
              <td>{v.plate || "-"}</td>
              <td>
                <Link className="btn btn-sm btn-primary" to={`/vehicles/${encodeURIComponent(v.id)}`}>Open</Link>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={4}>No vehicles.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
