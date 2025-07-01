@echo off
REM 🔧 Script de correction des erreurs CI/CD EduAI Enhanced
REM Fix CI/CD Errors for EduAI Enhanced

echo 🔧 Correction des erreurs CI/CD EduAI Enhanced...

echo 📦 Mise à jour des dépendances Python...
pip install --upgrade pip setuptools wheel

echo 🔧 Correction des conflits FastAPI/Starlette...
pip uninstall -y fastapi starlette uvicorn pydantic
pip install fastapi==0.109.2 uvicorn[standard]==0.27.1 pydantic==2.9.2

echo 📦 Installation des dépendances backend...
cd backend
pip install -c ../constraints.txt -r requirements.txt
cd ..

echo 🤖 Installation des dépendances AI services...
cd ai_services  
pip install -c ../constraints.txt -r requirements.txt
cd ..

echo 🎯 Installation des dépendances frontend...
cd frontend
call pnpm install --frozen-lockfile || call pnpm install --no-frozen-lockfile
cd ..

echo ✅ Correction des erreurs terminée !

echo 🧪 Test de l'installation...
python -c "import fastapi, uvicorn, pydantic; print('✅ Python dependencies OK')"

echo 🎉 Prêt pour le commit et push !
echo.
echo 💡 Commandes suggérées :
echo git add .
echo git commit -m "🔧 Fix: Corriger les conflits de dépendances CI/CD"
echo git push origin main
