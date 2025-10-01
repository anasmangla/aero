import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./pages/App.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import VehicleDetail from "./pages/VehicleDetail.jsx";
import Drivers from "./pages/Drivers.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/vehicles" />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="drivers" element={<Drivers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
