import React from "react";

interface CajaPreguntaTvProps {
  texto: string;
  categoria?: "carrera" | "logica";
}

export const CajaPreguntaTv: React.FC<CajaPreguntaTvProps> = ({
  texto,
  categoria,
}) => {
  return (
    <div className="relative flex items-center w-full max-w-5xl mx-auto my-2">
      {/* Línea horizontal metálica izquierda que conecta al borde */}
      <div className="hidden md:block w-8 lg:w-16 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-blue-200" />

      {/* Contenedor Principal Hexagonal Lozenge */}
      <div
        className="relative flex-1 flex items-center justify-center px-8 md:px-14 py-4 md:py-6 min-h-[85px] md:min-h-[110px] hex-lozenge text-center select-none shadow-[0_0_25px_rgba(20,60,180,0.5)]"
        style={{
          background:
            "linear-gradient(180deg, #10195e 0%, #080e3b 50%, #03051e 100%)",
          border: "2.5px solid #5a7fd8",
        }}
      >
        {/* Doble borde interior */}
        <div className="absolute inset-[4px] hex-lozenge border border-cyan-400/30 pointer-events-none" />

        {/* Badge de categoría sutil */}
        {categoria && (
          <span className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-blue-950/90 border border-cyan-500/40">
            {categoria === "carrera" ? "Ingeniería en Sistemas" : "Lógica y Algoritmos"}
          </span>
        )}

        {/* Texto de la Pregunta */}
        <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {texto}
        </h2>
      </div>

      {/* Línea horizontal metálica derecha que conecta al borde */}
      <div className="hidden md:block w-8 lg:w-16 h-[3px] bg-gradient-to-r from-blue-200 via-cyan-400 to-transparent" />
    </div>
  );
};
