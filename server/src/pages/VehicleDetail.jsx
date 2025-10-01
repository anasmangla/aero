// ...top imports unchanged...
const API = "http://localhost:8080";

export default function VehicleDetail() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);   // holds {source, stats, error}
  const [err, setErr] = useState("");
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ type:"oil", dueDate:"", dueMiles:"", dueHours:"", thresholdDays:"", thresholdMiles:"500", thresholdHours:"" });
  const fileRef = useRef();

  useEffect(() => {
    fetch(`${API}/api/vehicles/${encodeURIComponent(id)}/stats`)
      .then(r => r.json())
      .then(setPayload)
      .catch(e => setErr(e.message));

    fetch(`${API}/api/vehicles/${encodeURIComponent(id)}/maintenance-rules`)
      .then(r => r.json()).then(setRules).catch(()=>{});
  }, [id]);

  // ...submitRule and uploadDoc functions unchanged...

  return (
    <div>
      <h4 className="mb-3">Vehicle Detail</h4>
      <div className="mb-2 text-muted">ID: {id}</div>

      {err && <div className="alert alert-warning">Stats error: {err}</div>}

      <div className="mb-3">
        {payload?.error && (
          <div className="alert alert-info">
            Live stats not available yet. ({payload.error})
          </div>
        )}
        <pre className="p-3 bg-light border rounded" style={{whiteSpace:"pre-wrap"}}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {/* maintenance + docs blocks stay as you have them */}
      {/* ... */}
    </div>
  );
}
