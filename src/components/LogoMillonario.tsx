import React from "react";

interface LogoMillonarioProps {
  className?: string;
  size?: number;
  textoPrincipal?: string;
}

export const LogoMillonario: React.FC<LogoMillonarioProps> = ({
  className = "",
  size = 130,
  textoPrincipal = "INGENIERO",
}) => {
  return (
    <div
      className={`relative select-none flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Resplandor exterior circular */}
      <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-lg animate-pulse" />

      {/* SVG del Logo Fiel al Programa */}
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(40,110,255,0.7)]"
      >
        <defs>
          {/* Degradados */}
          <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a0b40" />
            <stop offset="70%" stopColor="#0a0524" />
            <stop offset="100%" stopColor="#040212" />
          </radialGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe885" />
            <stop offset="40%" stopColor="#e5a823" />
            <stop offset="70%" stopColor="#b37c0f" />
            <stop offset="100%" stopColor="#ffd857" />
          </linearGradient>

          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#b0c4de" />
            <stop offset="100%" stopColor="#50688c" />
          </linearGradient>

          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>

          {/* Rutas para texto curvo superior e inferior */}
          <path
            id="textPathTop"
            d="M 45,150 A 105,105 0 0,1 255,150"
            fill="none"
          />
          <path
            id="textPathBottom"
            d="M 33,150 A 117,117 0 0,0 267,150"
            fill="none"
          />
        </defs>

        {/* Anillo exterior con borde doble metálico */}
        <circle
          cx="150"
          cy="150"
          r="142"
          fill="none"
          stroke="url(#silverGrad)"
          strokeWidth="3"
        />
        <circle
          cx="150"
          cy="150"
          r="137"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="2"
        />

        {/* Fondo del círculo */}
        <circle cx="150" cy="150" r="135" fill="url(#ringBg)" />

        {/* Espiral central de signos de interrogación (?) dorados y cianes */}
        <g transform="translate(150,150)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <g key={idx} transform={`rotate(${angle})`}>
              <path
                d="M 0,-15 C 25,-40 50,-20 40,-5 C 32,8 10,15 0,35 C -5,22 -15,10 -25,-5 C -35,-25 -15,-45 0,-15 Z"
                fill="none"
                stroke={idx % 2 === 0 ? "url(#goldGrad)" : "url(#cyanGlow)"}
                strokeWidth="2.5"
                opacity="0.85"
              />
              <circle
                cx="0"
                cy="48"
                r="3.5"
                fill={idx % 2 === 0 ? "#ffd857" : "#00f0ff"}
              />
            </g>
          ))}
          {/* Anillo interior del vórtice */}
          <circle
            cx="0"
            cy="0"
            r="45"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Texto superior en arco */}
        <text
          fill="#f1d070"
          fontSize="13"
          fontWeight="900"
          letterSpacing="3"
          textAnchor="middle"
        >
          <textPath href="#textPathTop" startOffset="50%">
            QUIÉN QUIERE SER
          </textPath>
        </text>

        {/* Texto inferior en arco */}
        <text
          fill="#f1d070"
          fontSize="13"
          fontWeight="900"
          letterSpacing="3"
          textAnchor="middle"
        >
          <textPath href="#textPathBottom" startOffset="50%">
            EN SISTEMAS
          </textPath>
        </text>

        {/* Barra Central con el texto INGENIERO */}
        <g transform="translate(150, 150)">
          {/* Fondo de la placa */}
          <rect
            x="-130"
            y="-22"
            width="260"
            height="44"
            rx="8"
            fill="#06051f"
            stroke="url(#silverGrad)"
            strokeWidth="2"
          />
          <rect
            x="-127"
            y="-19"
            width="254"
            height="38"
            rx="6"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.2"
          />

          {/* Texto central */}
          <text
            x="0"
            y="7"
            fill="url(#silverGrad)"
            fontSize="18"
            fontWeight="900"
            letterSpacing="2.5"
            textAnchor="middle"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
          >
            {textoPrincipal}
          </text>
        </g>
      </svg>
    </div>
  );
};
