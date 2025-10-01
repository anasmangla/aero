import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/App.jsx";
import "./styles.css"; // ok if you don’t have it

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} /> {/* NOTE the /* */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
