#!/usr/bin/env node
/**
 * Remove códigos específicos do capasMap.ts
 */

const fs = require('fs');
const path = require('path');

// Lista de códigos a remover
const codigosParaRemover = [
  'SLUS-20596',
  'SLUS-20609',
  'SLUS-20626',
  'SLUS-20690',
  'SLUS-20693',
  'SLUS-20732',
  'SLUS-20733',
  'SLUS-20762',
  'SLUS-20764',
  'SLUS-20765',
  'SLUS-20775',
  'SLUS-20778',
  'SLUS-20782',
  'SLUS-20806',
  'SLUS-20816',
  'SLUS-20829',
  'SLUS-20840',
  'SLUS-20841',
  'SLUS-20844',
  'SLUS-20863',
  'SLUS-20875',
  'SLUS-20882',
  'SLUS-20892',
  'SLUS-20924',
  'SLUS-20937',
  'SLUS-20940',
  'SLUS-20957',
  'SLUS-20958',
  'SLUS-20979',
  'SLUS-21001',
  'SLUS-21002',
  'SLUS-21029',
  'SLUS-21036',
  'SLUS-21040',
  'SLUS-21069',
  'SLUS-21085',
  'SLUS-21170',
  'SLUS-21178',
  'SLUS-21198',
  'SLUS-21278',
];

const capasMapPath = path.join(process.cwd(), 'src', 'data', 'capasMap.ts');

console.log(`🔍 Lendo ${capasMapPath}...`);
const conteudo = fs.readFileSync(capasMapPath, 'utf8');

// Faz backup
const backupPath = capasMapPath + '.backup';
fs.writeFileSync(backupPath, conteudo, 'utf8');
console.log(`💾 Backup criado: ${backupPath}`);

// Remove as linhas com os códigos especificados
const linhas = conteudo.split('\n');
const novasLinhas = [];
let removidas = 0;

linhas.forEach(linha => {
  let manter = true;
  
  // Verifica se a linha contém algum dos códigos a remover
  for (const codigo of codigosParaRemover) {
    if (linha.includes(`"${codigo}":`)) {
      manter = false;
      removidas++;
      console.log(`❌ Removendo: ${codigo}`);
      break;
    }
  }
  
  if (manter) {
    novasLinhas.push(linha);
  }
});

// Salva o novo arquivo
const novoConteudo = novasLinhas.join('\n');
fs.writeFileSync(capasMapPath, novoConteudo, 'utf8');

console.log(`\n✅ Concluído!`);
console.log(`   📊 Linhas removidas: ${removidas}`);
console.log(`   💾 Arquivo atualizado: ${capasMapPath}`);
console.log(`\n🎮 Agora execute: npx expo start --clear`);
