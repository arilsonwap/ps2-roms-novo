#!/bin/bash

echo "🧪 TESTE LOCAL DO BUILD"
echo "======================="
echo ""

# 1. Verifica se dist existe
if [ ! -d "dist" ]; then
  echo "❌ Pasta dist não existe. Execute: npm run vercel-build"
  exit 1
fi

# 2. Roda diagnóstico
echo "🔍 Executando diagnóstico..."
node debug-vercel.js
echo ""

# 3. Testa servindo localmente
echo "🌐 Testando servidor local na porta 3000..."
echo ""
echo "Instalando servidor HTTP simples..."
npx -y http-server dist -p 3000 -c-1 --cors &
SERVER_PID=$!

sleep 2

echo ""
echo "✅ Servidor rodando!"
echo ""
echo "🌐 Acesse: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Aguarda Ctrl+C
wait $SERVER_PID
