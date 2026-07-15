#!/bin/bash
# Otomatik deploy script - Master'dan gh-pages'e

echo "🚀 Deployment başlıyor..."

# Master'a push
echo "📤 Master branch'e push ediliyor..."
git push origin master

# gh-pages'i güncelle
echo "🔄 gh-pages güncelleniyor..."
git checkout gh-pages
git reset --hard master
git push origin gh-pages --force
git checkout master

echo "✅ Deployment tamamlandı!"
echo "🌐 Site 30-60 saniye içinde güncellenecek"
