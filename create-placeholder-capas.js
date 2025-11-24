#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurações
const CAPAS_DIR = path.join(process.cwd(), 'assets', 'capas');
const CAPAS_MAP_FILE = path.join(process.cwd(), 'src', 'data', 'capasMap.ts');

// Placeholder: imagem 1x1 pixel transparente em WebP (base64)
// Vamos criar um arquivo .webp mínimo
const PLACEHOLDER_WEBP = Buffer.from(
  'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
  'base64'
);

console.log('🔍 Verificando capas faltantes...\n');

// Garante que o diretório existe
if (!fs.existsSync(CAPAS_DIR)) {
  fs.mkdirSync(CAPAS_DIR, { recursive: true });
}

// Lê o arquivo capasMap.ts
const capasMapContent = fs.readFileSync(CAPAS_MAP_FILE, 'utf8');

// Extrai todos os códigos de jogos do mapeamento
const codigoRegex = /"([^"]+)":\s*safeRequire\(\(\)\s*=>\s*require\("\.\.\/\.\.\/assets\/capas\/([^"]+)\.webp"\)/g;
let match;
const missingCapas = [];
const existingCapas = [];

while ((match = codigoRegex.exec(capasMapContent)) !== null) {
  const codigo = match[1];
  const filename = `${match[2]}.webp`;
  const filepath = path.join(CAPAS_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    existingCapas.push(codigo);
  } else {
    missingCapas.push({ codigo, filename, filepath });
  }
}

console.log(`✅ Capas encontradas: ${existingCapas.length}`);
console.log(`❌ Capas faltando: ${missingCapas.length}\n`);

if (missingCapas.length > 0) {
  console.log('📋 Criando placeholders para capas faltantes:');
  
  missingCapas.forEach(({ codigo, filename, filepath }) => {
    fs.writeFileSync(filepath, PLACEHOLDER_WEBP);
    console.log(`   ✅ ${filename}`);
  });
  
  console.log(`\n✅ ${missingCapas.length} placeholders criados!\n`);
} else {
  console.log('✅ Todas as capas estão presentes! Nenhum placeholder necessário.\n');
}

console.log('🎯 Agora você pode rodar: npm run deploy');
