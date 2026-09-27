import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { SelectorRol } from "./vistas/SelectorRol";
import { LoginAdmin } from "./vistas/LoginAdmin";
import { RutaAdmin } from "./vistas/RutaAdmin";
import { VistaAdministrador } from "./vistas/VistaAdministrador";
import { VistaParticipante } from "./vistas/VistaParticipante";
import { RUTA_ADMIN } from "./lib/supabase";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectorRol />} />
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/participante" element={<VistaParticipante />} />
        <Route
          path={RUTA_ADMIN}
          element={
            <RutaAdmin>
              <VistaAdministrador />
            </RutaAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
