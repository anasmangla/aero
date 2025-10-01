import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";

const API = "http://localhost:8080";

export default function VehicleDetail() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ type:"oil", dueDate:"", dueMiles:"", dueHours:"", thresholdDays:"", thresholdMiles:"500", thresholdHours:"" });
  const fileRef = useRef();

  useEffect(() => {
    fetch(`${API}/api/vehicles/${encodeURIComponent(id)}/stats`)
      .then(r => { if (!r.ok) throw new Error(`Stats ${r.status}`); return r.json(); })
      .then(setStats)
      .catch(e => setErr(e.message));

    fetch(`${API}/api/vehicles/${encodeURIComponent(id)}/maintenance-rules`)
      .then(r => r.json()).then(setRules).catch(()=>{});
  }, [id]);

  const submitRule = useCallback((e) => {
    e.preventDefault();
    const payload = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    fetch(`${API}/api/vehicles/${encodeURIComponent(id)}/maintenance-rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => { if (!r.ok) throw new Error("Create failed"); return r.json(); })
      .then(r => setRules(prev => [...prev, r]))
      .catch(err => alert(err.message));
  }, [form, id]);

  async function uploadDoc(e) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) return alert("Choose a file");
    const fd = new FormData();
    fd.append("file", f);
    fd.append("label", f.name);
    const res = await fetch(`${API}/api/docs/upload`, { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) return alert(json.error || "Upload failed");
    alert(`Uploaded: ${json.webViewLink || json.id}`);
  }

  return (
    <div>
      <h4 className="mb-3">Vehicle Detail</h4>
      <div className="mb-2 text-muted">ID: {id}</div>

      {err && <div className="alert alert-warning">Stats error: {err}</div>}
      <pre className="p-3 bg-light border rounded" style={{whiteSpace:"pre-wrap"}}>
        {JSON.stringify(stats, null, 2)}
      </pre>

      <h5 className="mt-4">Maintenance Rules</h5>
      <form className="row gy-2" onSubmit={submitRule}>
        <div className="col-12 col-md-3">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
            <option value="registration">registration</option>
            <option value="inspection">inspection</option>
            <option value="oil">oil</option>
            <option value="tires">tires</option>
            <option value="brakes">brakes</option>
            <option value="custom">custom</option>
          </select>
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-control" value={form.dueDate||""} onChange={e=>setForm(f=>({...f, dueDate:e.target.value}))}/>
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label">Due Miles</label>
          <input type="number" className="form-control" value={form.dueMiles||""} onChange={e=>setForm(f=>({...f, dueMiles:e.target.value}))}/>
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label">Due Hours</label>
          <input type="number" className="form-control" value={form.dueHours||""} onChange={e=>setForm(f=>({...f, dueHours:e.target.value}))}/>
        </div>
        <div className="col-4 col-md-2">
          <label className="form-label">Warn Days</label>
          <input type="number" className="form-control" value={form.thresholdDays||""} onChange={e=>setForm(f=>({...f, thresholdDays:e.target.value}))}/>
        </div>
        <div className="col-4 col-md-2">
          <label className="form-label">Warn Miles</label>
          <input type="number" className="form-control" value={form.thresholdMiles||""} onChange={e=>setForm(f=>({...f, thresholdMiles:e.target.value}))}/>
        </div>
        <div className="col-4 col-md-2">
          <label className="form-label">Warn Hours</label>
          <input type="number" className="form-control" value={form.thresholdHours||""} onChange={e=>setForm(f=>({...f, thresholdHours:e.target.value}))}/>
        </div>
        <div className="col-12">
          <button className="btn btn-primary mt-2" type="submit">Add Rule</button>
        </div>
      </form>

      <table className="table table-sm mt-3">
        <thead><tr><th>Type</th><th>Due Date</th><th>Due Miles</th><th>Due Hours</th><th>Warn</th></tr></thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id}>
              <td>{r.type}</td>
              <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}</td>
              <td>{r.dueMiles ?? "-"}</td>
              <td>{r.dueHours ?? "-"}</td>
              <td>{[r.thresholdDays??"-", r.thresholdMiles??"-", r.thresholdHours??"-"].join(" / ")}</td>
            </tr>
          ))}
          {!rules.length && <tr><td colSpan={5}>No rules yet.</td></tr>}
        </tbody>
      </table>

      <h5 className="mt-4">Documents</h5>
      <form className="mt-2" onSubmit={uploadDoc}>
        <input ref={fileRef} type="file" className="form-control mb-2" />
        <button className="btn btn-secondary" type="submit">Upload Document</button>
      </form>
    </div>
  );
}
