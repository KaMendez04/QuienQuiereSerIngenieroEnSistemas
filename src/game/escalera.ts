export interface NivelEscalera {
  nivel: number;
  titulo: string;
  premio: string;
  esSeguro?: boolean;
  etiquetaEspecial?: string;
}

export const ESCALERA: NivelEscalera[] = [
  { nivel: 15, titulo: "Ingeniero Senior", premio: "1,000,000 PTS", esSeguro: true, etiquetaEspecial: "Premio Mayor" },
  { nivel: 14, titulo: "Magister en Ingeniería", premio: "500,000 PTS" },
  { nivel: 13, titulo: "Líder de Proyecto", premio: "250,000 PTS" },
  { nivel: 12, titulo: "Experto en Redes", premio: "125,000 PTS" },
  { nivel: 11, titulo: "DevOps Engineer", premio: "64,000 PTS" },
  { nivel: 10, titulo: "Arquitecto de Software", premio: "32,000 PTS", esSeguro: true, etiquetaEspecial: "Seguro 2" },
  { nivel: 9, titulo: "Desarrollador Full Stack", premio: "16,000 PTS" },
  { nivel: 8, titulo: "Domador de bases de datos", premio: "8,000 PTS" },
  { nivel: 7, titulo: "Analista de Sistemas", premio: "4,000 PTS" },
  { nivel: 6, titulo: "Pasante de desarrollo", premio: "2,000 PTS" },
  { nivel: 5, titulo: "Rey del debugging", premio: "1,000 PTS", esSeguro: true, etiquetaEspecial: "Seguro 1" },
  { nivel: 4, titulo: "Programador Junior", premio: "500 PTS" },
  { nivel: 3, titulo: "Sobreviviente de Cálculo I", premio: "300 PTS" },
  { nivel: 2, titulo: "Kardex aprobado", premio: "200 PTS" },
  { nivel: 1, titulo: "Estudiante de primer ingreso", premio: "100 PTS" },
];
