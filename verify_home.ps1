# Vérification des fichiers - Page d'Accueil
# Scripts PowerShell pour Windows

Write-Host "🔍 Vérification des fichiers créés/modifiés..." -ForegroundColor Blue
Write-Host ""

$files = @(
    "frontend/src/pages/Home.jsx",
    "frontend/src/components/ProductCard.jsx",
    "frontend/src/components/SectorCard.jsx",
    "frontend/src/styles/home.css",
    "README_HOME_PAGE.md",
    "QUICK_START_HOME.md",
    "RESUME_MODIFICATIONS.md",
    "frontend/src/App.jsx"
)

$success = 0
$total = $files.Count

Write-Host "📁 Vérification des fichiers :" -ForegroundColor Green
Write-Host ""

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
        $success++
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Résultat : $success/$total fichiers trouvés" -ForegroundColor Cyan

if ($success -eq $total) {
    Write-Host ""
    Write-Host "✅ Tous les fichiers sont en place !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "1. cd frontend"
    Write-Host "2. npm install"
    Write-Host "3. npm run dev"
    Write-Host "4. Accédez à http://localhost:5173/home"
} else {
    Write-Host ""
    Write-Host "⚠️  Certains fichiers manquent." -ForegroundColor Red
}
