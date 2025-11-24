// src/data/games_ps2.ts
import jogos from "@/data/resultados_iso_com_capas.json";

export interface JogoPS2 {
  arquivo: string;
  codigos: string[];
  capa: string | null;
  capa_encontrada: boolean;
}

export const gamesPs2: JogoPS2[] = jogos.resultados.map((item: any) => ({
  nome: item.arquivo.replace(".iso", ""),
  codigos: item.codigos,
  capa: item.capa_encontrada ? item.capa : null,
}));

