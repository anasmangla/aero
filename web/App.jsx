import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/vehicles")
      .then(res => setVehicles(res.data.data || res.data)) // adjust if needed
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h1>Aero Fleet Dashboard</h1>
      <h2>Vehicles</h2>
      <ul>
        {vehicles.map((v, i) => (
          <li key={i}>
            {v.name || v.vin || v.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
