# app.py
import sys
import os

# Ajouter le répertoire parent au path pour les imports absolus
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services.data_loader import ProductDataLoader
from chatbot.intelligent_search import IntelligentSearch
from chatbot.recommendation_service import RecommendationService
from chatbot.conversation import ConversationManager
from comparateur.smart_comparator import SmartComparator
from chatbot.open_chat_engine import OpenChatEngine

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialisation unique et centralisée
def init_services():
    """Initialise tous les services dans le bon ordre"""
    # 1. Data loader (charge les produits)
    data_loader = ProductDataLoader('../backend/data/productData.js')
    data_loader.load_products()
    
    # 2. Moteur de recherche (dépend de data_loader)
    search_engine = IntelligentSearch(data_loader)
    
    # 3. Service de recommandation (dépend de data_loader)
    recommendation_service = RecommendationService(data_loader)
    
    # 4. Comparateur (dépend de data_loader)
    comparator = SmartComparator(data_loader)
    
    # 5. Gestionnaire de conversation (indépendant)
    conversation_manager = ConversationManager()
    
    # 6. Moteur de chat (dépend de tout)
    chat_engine = OpenChatEngine(data_loader, search_engine, comparator, recommendation_service)
    
    return {
        'data_loader': data_loader,
        'search_engine': search_engine,
        'recommendation_service': recommendation_service,
        'comparator': comparator,
        'conversation_manager': conversation_manager,
        'chat_engine': chat_engine
    }

# Initialisation
services = init_services()
data_loader = services['data_loader']
conversation_manager = services['conversation_manager']
chat_engine = services['chat_engine']

print(f" Chatbot initialisé avec {len(data_loader.get_all_products())} produits")
print(f" Catégories: {len(data_loader.get_all_categories())}")
print(f" Mode: conversation ouverte + comparaison globale")

# Routes (identiques à votre code)
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '').strip()
        user_id = data.get('user_id', 'default')

        if not message:
            return jsonify({'success': False, 'response': 'Message vide.', 'products': []}), 400

        print(f"\n📨 Message reçu de {user_id}: '{message[:50]}...'")

        conversation_manager.add_message(user_id, 'user', message)
        session = conversation_manager.get_or_create_session(user_id)

        result = chat_engine.process(message, session)

        conversation_manager.add_message(user_id, 'assistant', result['response'], result.get('products', []))

        response_data = {
            'success': True,
            'response': result['response'],
            'products': [p.to_dict() for p in result.get('products', [])],
            'action': result.get('action', 'chat'),
        }

        if result.get('comparison'):
            response_data['comparison'] = result['comparison']
        if result.get('comparison_type'):
            response_data['comparison_type'] = result['comparison_type']
        if result.get('categories'):
            response_data['categories'] = result['categories']
        if result.get('best_product'):
            response_data['best_product'] = result['best_product']

        return jsonify(response_data)

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
        'mode': 'open_conversation',
        'features': ['comparison', 'global_comparison', 'comparison_by_criteria']
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


@app.route('/api/stats', methods=['GET'])
def get_stats():
    products = data_loader.get_all_products()
    
    if not products:
        return jsonify({'stats': {}})
    
    prices = [p.price for p in products]
    
    stats = {
        'total_products': len(products),
        'total_categories': len(data_loader.get_all_categories()),
        'avg_price': sum(prices) / len(prices),
        'min_price': min(prices),
        'max_price': max(prices),
        'total_stock': sum(p.stock for p in products),
        'products_in_stock': sum(1 for p in products if p.stock > 0),
        'total_orders': sum(p.order_count for p in products),
        'avg_rating': sum(p.rating for p in products) / len(products),
    }
    
    return jsonify({'stats': stats})


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f" Serveur démarré sur http://localhost:{port}")
    app.run(debug=True, port=port)