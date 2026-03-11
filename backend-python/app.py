import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from dotenv import load_dotenv

from services.data_loader import ProductDataLoader
from chatbot.intelligent_search import IntelligentSearch
from chatbot.recommendation_service import RecommendationService
from chatbot.conversation import ConversationManager
from comparateur.smart_comparator import SmartComparator
from chatbot.open_chat_engine import OpenChatEngine
from utils.text_processor import TextProcessor

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialisation
data_loader = ProductDataLoader('../backend/data/productData.js')
data_loader.load_products()

# Services
search_engine = IntelligentSearch(data_loader)
recommendation_service = RecommendationService(data_loader)
comparator = SmartComparator(data_loader)
conversation_manager = ConversationManager()
text_processor = TextProcessor()
chat_engine = OpenChatEngine(data_loader, search_engine, comparator, recommendation_service)

print(f"✅ Chatbot initialisé avec {len(data_loader.get_all_products())} produits")
print("🎯 Mode conversation OUVERTE activé")


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '').strip()
        user_id = data.get('user_id', 'default')

        if not message:
            return jsonify({'success': False, 'response': 'Message vide.', 'products': []}), 400

        print(f"\n📨 Message reçu de {user_id}: '{message}'")

        # Ajouter au contexte
        conversation_manager.add_message(user_id, 'user', message)
        session = conversation_manager.get_or_create_session(user_id)

        # Traitement via le moteur de conversation ouverte
        result = chat_engine.process(message, session)

        # Ajouter la réponse à l'historique
        conversation_manager.add_message(user_id, 'assistant', result['response'], result.get('products', []))

        print(f"✅ Réponse générée ({result['action']}): {result['response'][:80]}...")
        print(f"📦 Produits: {len(result.get('products', []))}")

        return jsonify({
            'success': True,
            'response': result['response'],
            'products': [p.to_dict() for p in result.get('products', [])],
            'action': result.get('action', 'chat'),
            'comparison': result.get('comparison'),
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'response': "Désolé, une erreur technique est survenue. Réessayez.",
            'products': []
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'products': len(data_loader.get_all_products()),
        'categories': len(data_loader.get_all_categories()),
        'mode': 'open_conversation'
    })


@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = data_loader.get_all_categories()
    result = []
    for cat in sorted(categories):
        count = len(data_loader.get_products_by_category(cat))
        if count > 0:
            result.append({'name': cat, 'count': count})
    return jsonify({'categories': result})


@app.route('/api/products', methods=['GET'])
def get_products():
    products = data_loader.get_all_products()
    return jsonify({'products': [p.to_dict() for p in products]})


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"🚀 Serveur démarré sur http://localhost:{port}")
    app.run(debug=True, port=port)