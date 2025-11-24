#!/bin/bash

echo "🚀 DEPLOY FINAL - PS2 ROMS"
echo "=========================="
echo ""

# 1. Build
echo "📦 1/4: Criando placeholders..."
npm run fix-capas

echo ""
echo "📦 2/4: Executando build..."
expo export --platform web --clear

# 2. Prepara public/
echo ""
echo "📂 3/4: Preparando pasta public/..."
rm -rf public
mkdir public
cp -r dist/* public/

# 3. Verifica
echo ""
echo "📊 Tamanho de public/:"
du -sh public/

echo ""
echo "📋 Conteúdo de public/:"
ls -lh public/ | head -10

# 4. Deploy
echo ""
echo "🚀 4/4: Fazendo deploy no Vercel..."
rm -rf .vercel
npx vercel --prod --yes

echo ""
echo "✅ DEPLOY COMPLETO!"
