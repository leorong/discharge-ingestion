import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import DischargesPage from "./pages/DischargesPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/discharges" element={<DischargesPage />} />
      </Routes>
    </Router>
  );
}