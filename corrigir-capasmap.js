#!/usr/bin/env node
/**
 * Corrige o capasMap.ts removendo entradas de arquivos que não existem
 */

const fs = require('fs');
const path = require('path');

const capasMapPath = path.join(process.cwd(), 'src', 'data', 'capasMap.ts');
const capasDir = path.join(process.cwd(), 'assets', 'capas');

console.log('🔍 Lendo capasMap.ts...');
const conteudo = fs.readFileSync(capasMapPath, 'utf8');

// Extrai todas as linhas com require
const linhas = conteudo.split('\n');
const novasLinhas = [];
let removidas = [];
let mantidas = 0;

linhas.forEach((linha, index) => {
  // Se a linha contém um require de capa
  const match = linha.match(/"([A-Z]{4}-[0-9]{5})":\s*require\("\.\.\/\.\.\/assets\/capas\/([A-Z]{4}-[0-9]{5})\.webp"\)/);
  
  if (match) {
    const codigo = match[1];
    const arquivo = path.join(capasDir, `${codigo}.webp`);
    
    if (fs.existsSync(arquivo)) {
      novasLinhas.push(linha);
      mantidas++;
    } else {
      removidas.push(codigo);
      console.log(`❌ Removendo: ${codigo}.webp (não existe)`);
    }
  } else {
    // Linhas que não são require (cabeçalho, comentários, etc)
    novasLinhas.push(linha);
  }
});

// Gera o novo conteúdo
const novoConteudo = novasLinhas.join('\n');

// Faz backup do arquivo original
const backupPath = capasMapPath + '.backup';
fs.copyFileSync(capasMapPath, backupPath);
console.log(`\n💾 Backup criado: ${backupPath}`);

// Salva o novo arquivo
fs.writeFileSync(capasMapPath, novoConteudo, 'utf8');

console.log(`\n✅ Arquivo corrigido!`);
console.log(`   📊 Capas mantidas: ${mantidas}`);
console.log(`   ❌ Capas removidas: ${removidas.length}`);

if (removidas.length > 0) {
  console.log(`\n🗑️  Capas removidas:`);
  removidas.forEach(codigo => console.log(`   - ${codigo}`));
}
