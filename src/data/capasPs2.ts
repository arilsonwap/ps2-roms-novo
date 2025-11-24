// src/data/capasPs2.ts
import capasPs2 from "../../assets/capas_ps2/capasPs2.json";

/**
 * Retorna a URL da capa do jogo com base no nome ou ID.
 * Aceita nomes com espaços, maiúsculas/minúsculas e extensões .iso.
 */
export const getCapa = (nomeOuId: string): string | null => {
  if (!nomeOuId) return null;
  const chave = nomeOuId
    .toLowerCase()
    .replace(/\.iso$/i, "")
    .replace(/\s+/g, "-");
  return capasPs2[chave] || null;
};

/**
 * Retorna todas as chaves (nomes/IDs) do JSON, útil para gerar listas.
 */
export const getTodosOsJogos = (): { nome: string; url: string }[] => {
  return Object.entries(capasPs2).map(([nome, url]) => ({
    nome,
    url: url as string,
  }));
};
