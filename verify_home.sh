#!/bin/bash
# VÉRIFICATION DES FICHIERS - Page d'Accueil

echo "🔍 Vérification des fichiers créés/modifiés..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
SUCCESS=0

# Fonction de vérification
check_file() {
  TOTAL=$((TOTAL + 1))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}❌${NC} $1"
  fi
}

# Fichiers à vérifier
echo "📁 Fichiers CRÉÉS :"
check_file "frontend/src/pages/Home.jsx"
check_file "frontend/src/components/ProductCard.jsx"
check_file "frontend/src/components/SectorCard.jsx"
check_file "frontend/src/styles/home.css"
check_file "README_HOME_PAGE.md"
check_file "QUICK_START_HOME.md"
check_file "RESUME_MODIFICATIONS.md"

echo ""
echo "📝 Fichiers MODIFIÉS :"
check_file "frontend/src/App.jsx"

echo ""
echo "📊 Résultat : ${GREEN}$SUCCESS/$TOTAL${NC} fichiers trouvés"

if [ $SUCCESS -eq $TOTAL ]; then
  echo -e "${GREEN}✅ Tous les fichiers sont en place !${NC}"
  echo ""
  echo "🚀 Prochaines étapes :"
  echo "1. cd frontend && npm install && npm run dev"
  echo "2. Accédez à http://localhost:5173/home"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  Certains fichiers manquent.${NC}"
  exit 1
fi
