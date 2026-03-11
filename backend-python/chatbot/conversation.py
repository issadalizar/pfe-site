# chatbot/conversation.py
from datetime import datetime


class ConversationManager:
    def __init__(self):
        self.sessions = {}

    def get_or_create_session(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = {
                'history': [],
                'context': {
                    'last_products': [],       # Derniers produits affichés
                    'last_action': None,        # Dernière action
                    'comparison_products': [],  # Produits en cours de comparaison
                    'price_filter': None,       # Filtre prix actif
                    'category_filter': None,    # Filtre catégorie actif
                }
            }
        return self.sessions[user_id]

    def add_message(self, user_id, role, content, products=None):
        session = self.get_or_create_session(user_id)
        entry = {
            'role': role,
            'content': content,
            'time': datetime.now().isoformat(),
            'products': products or []
        }
        session['history'].append(entry)

        # Mettre à jour le contexte
        if products:
            session['context']['last_products'] = products

        return session

    def update_context(self, user_id, **kwargs):
        session = self.get_or_create_session(user_id)
        session['context'].update(kwargs)

    def get_recent_products(self, user_id, n=6):
        """Récupère les derniers produits consultés par l'utilisateur"""
        session = self.get_or_create_session(user_id)
        products = []
        for msg in reversed(session['history'][-20:]):
            for p in msg.get('products', []):
                if p not in products:
                    products.append(p)
            if len(products) >= n:
                break
        return products[:n]

    def get_history(self, user_id, n=10):
        session = self.get_or_create_session(user_id)
        return session['history'][-n:]

    def clear_session(self, user_id):
        if user_id in self.sessions:
            del self.sessions[user_id]