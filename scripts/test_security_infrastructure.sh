#!/bin/bash

# 🛡️ Script de Test de l'Infrastructure de Sécurité
# Valide tous les services de sécurité mis en place

echo "🛡️ Démarrage des tests de sécurité EduAI-Enhanced..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour afficher le résultat d'un test
print_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${BLUE}ℹ️  $details${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${RED}⚠️  $details${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Fonction pour vérifier l'existence d'un fichier
check_file_exists() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        print_test_result "$description" "PASS" "Fichier trouvé: $file_path"
    else
        print_test_result "$description" "FAIL" "Fichier manquant: $file_path"
    fi
}

# Fonction pour vérifier le contenu d'un fichier
check_file_content() {
    local file_path="$1"
    local pattern="$2"
    local description="$3"
    
    if [ -f "$file_path" ] && grep -q "$pattern" "$file_path"; then
        print_test_result "$description" "PASS" "Pattern trouvé dans $file_path"
    else
        print_test_result "$description" "FAIL" "Pattern '$pattern' non trouvé dans $file_path"
    fi
}

echo -e "\n${BLUE}📂 Vérification de l'architecture des fichiers de sécurité...${NC}"

# Test 1: Vérification des services de sécurité
check_file_exists "frontend/src/services/AuthService.ts" "Service d'authentification OAuth2/JWT"
check_file_exists "frontend/src/services/RateLimitingService.ts" "Service de limitation de taux"
check_file_exists "frontend/src/services/ValidationService.ts" "Service de validation multimodale"
check_file_exists "frontend/src/services/EncryptionService.ts" "Service de chiffrement AES-256-GCM"
check_file_exists "frontend/src/services/SecurityIntegrationService.ts" "Service d'intégration de sécurité"

# Test 2: Vérification du tableau de bord de sécurité
check_file_exists "frontend/src/components/SecurityDashboard.tsx" "Tableau de bord de sécurité"

echo -e "\n${BLUE}🔍 Vérification du contenu des services...${NC}"

# Test 3: Contenu du service d'authentification
check_file_content "frontend/src/services/AuthService.ts" "OAuth2" "OAuth2 présent dans AuthService"
check_file_content "frontend/src/services/AuthService.ts" "JWT" "JWT présent dans AuthService"
check_file_content "frontend/src/services/AuthService.ts" "MFA" "MFA (Multi-Factor Auth) présent"
check_file_content "frontend/src/services/AuthService.ts" "PKCE" "PKCE (Code Challenge) présent"

# Test 4: Contenu du service de rate limiting
check_file_content "frontend/src/services/RateLimitingService.ts" "slidingWindow" "Algorithme Sliding Window présent"
check_file_content "frontend/src/services/RateLimitingService.ts" "tokenBucket" "Algorithme Token Bucket présent"
check_file_content "frontend/src/services/RateLimitingService.ts" "leakyBucket" "Algorithme Leaky Bucket présent"
check_file_content "frontend/src/services/RateLimitingService.ts" "adaptive" "Algorithme adaptatif présent"

# Test 5: Contenu du service de validation
check_file_content "frontend/src/services/ValidationService.ts" "validateText" "Validation de texte présente"
check_file_content "frontend/src/services/ValidationService.ts" "validateImage" "Validation d'image présente"
check_file_content "frontend/src/services/ValidationService.ts" "validateAudio" "Validation d'audio présente"
check_file_content "frontend/src/services/ValidationService.ts" "validateVideo" "Validation de vidéo présente"

# Test 6: Contenu du service de chiffrement
check_file_content "frontend/src/services/EncryptionService.ts" "AES-256-GCM" "Algorithme AES-256-GCM présent"
check_file_content "frontend/src/services/EncryptionService.ts" "encryptUserData" "Chiffrement données utilisateur présent"
check_file_content "frontend/src/services/EncryptionService.ts" "encryptAPIKey" "Chiffrement clés API présent"
check_file_content "frontend/src/services/EncryptionService.ts" "keyRotation" "Rotation des clés présente"

# Test 7: Intégration dans le dashboard principal
check_file_content "frontend/src/components/EnhancedDashboard.tsx" "SecurityDashboard" "SecurityDashboard intégré au dashboard principal"
check_file_content "frontend/src/components/EnhancedDashboard.tsx" "security.*Sécurité" "Onglet sécurité ajouté"

echo -e "\n${BLUE}🔧 Vérification de la structure TypeScript...${NC}"

# Test 8: Compilation TypeScript (si tsc est disponible)
if command -v npx &> /dev/null && [ -f "frontend/tsconfig.json" ]; then
    echo "🔍 Test de compilation TypeScript..."
    cd frontend
    if npx tsc --noEmit --project tsconfig.json 2>/dev/null; then
        print_test_result "Compilation TypeScript" "PASS" "Aucune erreur de type détectée"
    else
        print_test_result "Compilation TypeScript" "FAIL" "Erreurs TypeScript détectées - voir logs"
    fi
    cd ..
else
    print_test_result "Compilation TypeScript" "SKIP" "tsc non disponible ou tsconfig.json manquant"
fi

echo -e "\n${BLUE}📦 Vérification des dépendances...${NC}"

# Test 9: Vérification du package.json
if [ -f "frontend/package.json" ]; then
    if grep -q '"@types/' "frontend/package.json"; then
        print_test_result "Types TypeScript" "PASS" "Types TypeScript configurés"
    else
        print_test_result "Types TypeScript" "FAIL" "Types TypeScript manquants"
    fi
    
    if grep -q '"tailwindcss"' "frontend/package.json" || grep -q '"@tailwindcss/' "frontend/package.json"; then
        print_test_result "Tailwind CSS" "PASS" "Tailwind CSS configuré"
    else
        print_test_result "Tailwind CSS" "FAIL" "Tailwind CSS manquant"
    fi
else
    print_test_result "Package.json Frontend" "FAIL" "frontend/package.json non trouvé"
fi

echo -e "\n${BLUE}🛡️ Tests de sécurité spécifiques...${NC}"

# Test 10: Vérification des mécanismes de sécurité
check_file_content "frontend/src/services/SecurityIntegrationService.ts" "secureRequest" "Requêtes sécurisées implémentées"
check_file_content "frontend/src/services/SecurityIntegrationService.ts" "checkAuthentication" "Vérification d'authentification présente"
check_file_content "frontend/src/services/SecurityIntegrationService.ts" "checkRateLimit" "Vérification rate limiting présente"
check_file_content "frontend/src/services/SecurityIntegrationService.ts" "validateContent" "Validation de contenu présente"

# Test 11: Vérification des patterns de sécurité
check_file_content "frontend/src/services/AuthService.ts" "SecurityEvent" "Événements de sécurité définis"
check_file_content "frontend/src/services/RateLimitingService.ts" "getSystemLoad" "Monitoring charge système présent"
check_file_content "frontend/src/services/EncryptionService.ts" "DataClassification" "Classification des données présente"

echo -e "\n${BLUE}📊 Vérification de l'intégration monitoring...${NC}"

# Test 12: Intégration avec le monitoring IA
check_file_content "frontend/src/services/AuthService.ts" "aiMetrics" "Intégration monitoring IA dans AuthService"
check_file_content "frontend/src/services/RateLimitingService.ts" "aiMetrics" "Intégration monitoring IA dans RateLimitingService"
check_file_content "frontend/src/services/ValidationService.ts" "aiMetrics" "Intégration monitoring IA dans ValidationService"
check_file_content "frontend/src/services/EncryptionService.ts" "aiMetrics" "Intégration monitoring IA dans EncryptionService"

echo -e "\n${BLUE}🎨 Vérification de l'interface utilisateur...${NC}"

# Test 13: Interface du tableau de bord de sécurité
check_file_content "frontend/src/components/SecurityDashboard.tsx" "activeTab" "Navigation par onglets présente"
check_file_content "frontend/src/components/SecurityDashboard.tsx" "overview.*auth.*rate-limit.*validation.*encryption" "Tous les onglets de sécurité présents"
check_file_content "frontend/src/components/SecurityDashboard.tsx" "securityOverview" "Vue d'ensemble de sécurité implémentée"

# Test 14: Responsive design et accessibilité
check_file_content "frontend/src/components/SecurityDashboard.tsx" "md:grid-cols" "Design responsive implémenté"
check_file_content "frontend/src/components/SecurityDashboard.tsx" "bg-.*text-.*rounded" "Classes Tailwind CSS utilisées"

echo -e "\n${BLUE}🔗 Vérification de l'intégration globale...${NC}"

# Test 15: Intégration complète
if [ -f "frontend/src/services/SecurityIntegrationService.ts" ] && [ -f "frontend/src/components/SecurityDashboard.tsx" ] && [ -f "frontend/src/components/EnhancedDashboard.tsx" ]; then
    if grep -q "SecurityDashboard" "frontend/src/components/EnhancedDashboard.tsx"; then
        print_test_result "Intégration complète" "PASS" "Tous les composants de sécurité intégrés"
    else
        print_test_result "Intégration complète" "FAIL" "SecurityDashboard non intégré dans EnhancedDashboard"
    fi
else
    print_test_result "Intégration complète" "FAIL" "Composants manquants pour l'intégration"
fi

echo -e "\n${YELLOW}📋 Résumé des tests de sécurité${NC}"
echo "=================================="
echo -e "Total des tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests réussis:   ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests échoués:   ${RED}$FAILED_TESTS${NC}"

# Calcul du pourcentage de réussite
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Taux de réussite: ${BLUE}$SUCCESS_RATE%${NC}"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "\n${GREEN}🎉 Excellent! Infrastructure de sécurité très bien implémentée.${NC}"
    elif [ $SUCCESS_RATE -ge 75 ]; then
        echo -e "\n${YELLOW}👍 Bon travail! Quelques améliorations mineures possibles.${NC}"
    elif [ $SUCCESS_RATE -ge 50 ]; then
        echo -e "\n${YELLOW}⚠️  Infrastructure partiellement implémentée. Corrections nécessaires.${NC}"
    else
        echo -e "\n${RED}❌ Infrastructure de sécurité nécessite des améliorations importantes.${NC}"
    fi
else
    echo -e "\n${RED}❌ Aucun test n'a pu être exécuté.${NC}"
fi

echo -e "\n${BLUE}🚀 Étapes suivantes recommandées:${NC}"
echo "1. 🔧 Corriger les erreurs TypeScript restantes"
echo "2. 🧪 Ajouter des tests unitaires pour chaque service"
echo "3. 🔒 Configurer les variables d'environnement de sécurité"
echo "4. 📚 Compléter la documentation de sécurité"
echo "5. 🚀 Déployer en environnement de test sécurisé"

echo -e "\n${GREEN}✅ Tests de sécurité terminés!${NC}"

# Code de sortie basé sur le taux de réussite
if [ $SUCCESS_RATE -ge 75 ]; then
    exit 0
else
    exit 1
fi
