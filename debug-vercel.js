#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO DO BUILD\n');

const distPath = path.join(process.cwd(), 'dist');

// 1. Verifica estrutura do dist
console.log('📂 Estrutura de dist/:\n');
function listDir(dir, indent = '') {
  if (!fs.existsSync(dir)) {
    console.log(`❌ Pasta ${dir} não existe!`);
    return;
  }
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      console.log(`${indent}📁 ${item}/`);
      if (indent.length < 8) { // Limita profundidade
        listDir(fullPath, indent + '  ');
      }
    } else {
      const size = (stat.size / 1024).toFixed(1);
      console.log(`${indent}📄 ${item} (${size} KB)`);
    }
  });
}

listDir(distPath);

// 2. Verifica index.html
console.log('\n📄 Conteúdo de dist/index.html:\n');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  console.log(content);
} else {
  console.log('❌ index.html não encontrado!');
}

// 3. Verifica se JS bundle existe
console.log('\n🔍 Procurando bundle JavaScript:\n');
const expoDir = path.join(distPath, '_expo');
if (fs.existsSync(expoDir)) {
  const staticDir = path.join(expoDir, 'static');
  if (fs.existsSync(staticDir)) {
    const jsDir = path.join(staticDir, 'js', 'web');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      files.forEach(file => {
        const fullPath = path.join(jsDir, file);
        const stat = fs.statSync(fullPath);
        const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
        console.log(`✅ ${file} (${sizeMB} MB)`);
      });
    }
  }
}

// 4. Verifica assets/fonts
console.log('\n🔤 Verificando fontes em dist/assets/fonts/:\n');
const fontsPath = path.join(distPath, 'assets', 'fonts');
if (fs.existsSync(fontsPath)) {
  const fonts = fs.readdirSync(fontsPath);
  console.log(`✅ ${fonts.length} fontes encontradas`);
  fonts.slice(0, 5).forEach(font => console.log(`   - ${font}`));
  if (fonts.length > 5) console.log(`   ... e mais ${fonts.length - 5}`);
} else {
  console.log('❌ Pasta assets/fonts não existe!');
}

// 5. Verifica assets/capas
console.log('\n🖼️  Verificando capas em dist/assets/capas/:\n');
const capasPath = path.join(distPath, 'assets', 'capas');
if (fs.existsSync(capasPath)) {
  const capas = fs.readdirSync(capasPath).filter(f => f.endsWith('.webp'));
  console.log(`✅ ${capas.length} capas encontradas`);
  
  // Verifica placeholders
  const placeholders = capas.filter(f => {
    const stat = fs.statSync(path.join(capasPath, f));
    return stat.size === 44; // Tamanho do placeholder
  });
  
  if (placeholders.length > 0) {
    console.log(`   ℹ️  ${placeholders.length} são placeholders (44 bytes)`);
  }
} else {
  console.log('❌ Pasta assets/capas não existe!');
}

console.log('\n✅ Diagnóstico completo!');
