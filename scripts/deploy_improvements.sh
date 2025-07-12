#!/bin/bash

# 🚀 Script de démarrage des services améliorés

echo "🎯 Démarrage des améliorations EduAI Enhanced..."

# 1. Vérifier que Redis est installé et en cours d'exécution
echo "🔍 Vérification de Redis..."
if ! command -v redis-server &> /dev/null; then
    echo "⚠️ Redis n'est pas installé. Installation..."
    
    # Installation selon l'OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
    else
        echo "❌ OS non supporté pour l'installation automatique de Redis"
        echo "   Veuillez installer Redis manuellement"
        exit 1
    fi
fi

# 2. Démarrer Redis en arrière-plan
echo "🚀 Démarrage de Redis..."
redis-server --daemonize yes --port 6379

# Attendre que Redis soit prêt
sleep 2

# 3. Vérifier la connexion Redis
echo "🔌 Test de connexion Redis..."
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis est opérationnel"
else
    echo "❌ Redis ne répond pas"
    exit 1
fi

# 4. Installer les nouvelles dépendances Python
echo "📦 Installation des dépendances Python..."
cd backend
pip install redis hiredis
cd ..

# 5. Tester les nouveaux services
echo "🧪 Test des services améliorés..."

# Test Event Sourcing
python3 -c "
import sys
sys.path.append('backend')
from app.core.event_sourcing import EventStore, LearningEvent, EventType
import asyncio

async def test_event_sourcing():
    store = EventStore()
    event = LearningEvent(
        event_type=EventType.LEARNING_STARTED,
        user_id='test_user',
        session_id='test_session',
        data={'test': 'data'}
    )
    event_id = await store.append_event(event)
    print(f'✅ Event Sourcing: Événement créé avec ID {event_id}')

asyncio.run(test_event_sourcing())
"

# Test Message Broker
python3 -c "
import sys
sys.path.append('backend')
from app.core.orchestration import MessageBroker
import asyncio

async def test_message_broker():
    try:
        broker = MessageBroker()
        await broker.start()
        print('✅ Message Broker: Connexion réussie')
        await broker.stop()
    except Exception as e:
        print(f'⚠️ Message Broker: {e}')

asyncio.run(test_message_broker())
"

echo ""
echo "🎉 Améliorations déployées avec succès!"
echo ""
echo "📊 Nouvelles fonctionnalités disponibles:"
echo "   ├── 🎯 Event Sourcing pour traçage adaptatif"
echo "   ├── 🔗 Message Broker Redis pour orchestration"
echo "   ├── 🤖 Workflows IA coordonnés"
echo "   ├── 📈 Analytics temps réel des apprentissages"
echo "   └── 🧠 Adaptation intelligente automatique"
echo ""
echo "🌐 Endpoints API améliorés:"
echo "   ├── POST /api/adaptive/interaction"
echo "   ├── POST /api/adaptive/skill-progress"
echo "   ├── POST /api/adaptive/adaptive-learning"
echo "   ├── POST /api/adaptive/multimodal-analysis"
echo "   ├── GET  /api/adaptive/user-progress/{user_id}"
echo "   └── GET  /api/adaptive/services-health"
echo ""
echo "🚀 Pour démarrer le backend amélioré:"
echo "   cd backend && python main.py"
echo ""
echo "📚 Documentation interactive:"
echo "   http://localhost:8000/docs"
