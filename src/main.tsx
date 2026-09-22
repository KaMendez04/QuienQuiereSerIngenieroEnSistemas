import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { VistaAdministrador } from "./vistas/VistaAdministrador";
import { VistaParticipante } from "./vistas/VistaParticipante";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VistaParticipante />} />
        <Route path="/participante" element={<VistaParticipante />} />
        <Route path="/4dm1n1str4d0r" element={<VistaAdministrador />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
