// verificar_capas.js
// Uso: node verificar_capas.js
//
// Requisitos:
// - rodar na raiz do projeto (mesmo nível de /src e /assets)
// - Node 16+ (você tem 20 então tá ok)

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando capas ausentes...\n");

// caminhos base (ajuste se seu projeto tiver nomes diferentes)
const CAMINHO_CAPAS_MAP = path.join(__dirname, "src", "data", "capasMap.ts");
const PASTA_CAPAS = path.join(__dirname, "assets", "capas");

// 1. ler o arquivo capasMap.ts
let conteudoCapasMap;
try {
  conteudoCapasMap = fs.readFileSync(CAMINHO_CAPAS_MAP, "utf8");
} catch (err) {
  console.error("❌ Não consegui ler src/data/capasMap.ts");
  console.error(err.message);
  process.exit(1);
}

// 2. extrair pares "SLUS-XXXXX": require("../../assets/capas/SLUS-XXXXX.webp")
//
// Exemplo que queremos capturar:
//   "SLUS-20596": require("../../assets/capas/SLUS-20596.webp"),
//
const regexLinha = /"([^"]+)":\s*require\(["'`](?:\.\.\/){2}assets\/capas\/([^"'`]+)["'`]\)/g;

const entradas = [];
let match;
while ((match = regexLinha.exec(conteudoCapasMap)) !== null) {
  const codigo = match[1]; // tipo "SLUS-20596"
  const arquivo = match[2]; // tipo "SLUS-20596.webp"
  entradas.push({ codigo, arquivo });
}

// segurança: caso não ache nada
if (entradas.length === 0) {
  console.log("⚠️ Não encontrei nenhuma entrada no capasMap.ts. Confere se o formato mudou?");
  process.exit(0);
}

// 3. checar se cada arquivo realmente existe na pasta assets/capas
const faltando = [];
const ok = [];

for (const { codigo, arquivo } of entradas) {
  const caminhoArquivoLocal = path.join(PASTA_CAPAS, arquivo);

  if (!fs.existsSync(caminhoArquivoLocal)) {
    faltando.push({ codigo, arquivo });
  } else {
    ok.push({ codigo, arquivo });
  }
}

// 4. imprimir resultado bonitinho

console.log(`🗂 Total esperado no mapa: ${entradas.length}`);
console.log(`✅ Encontrados: ${ok.length}`);
console.log(`❌ Faltando: ${faltando.length}\n`);

if (faltando.length > 0) {
  console.log("🚫 Capas ausentes (essas vão quebrar o require):\n");
  faltando.forEach((item) => {
    console.log(` - ${item.codigo}  |  ${item.arquivo}`);
  });

  console.log(`
📌 O que você pode fazer agora:
1. Ou você coloca esses arquivos .webp dentro de assets/capas com exatamente esses nomes
2. Ou, no capasMap.ts, troca essa linha por uma capa padrão, tipo:
   "${faltando[0].codigo}": require("../../assets/capas/placeholder.webp"),
3. Ou comenta a linha inteira se você não precisa dessa capa ainda
`);
} else {
  console.log("✨ Nenhuma capa faltando! Tudo certo 👌");
}

console.log("\nPronto.\n");

