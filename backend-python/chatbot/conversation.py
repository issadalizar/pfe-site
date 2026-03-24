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
                    'last_comparison_type': None, # Dernier type de comparaison
                    'comparison_warning': None,   # Message d'avertissement
                    'viewing_global': False,      # Si on est en mode global
                    'global_criteria': None,      # Critère de comparaison globale
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
    
    def reset_context(self, user_id):
        """Réinitialise le contexte tout en gardant l'historique"""
        session = self.get_or_create_session(user_id)
        session['context'] = {
            'last_products': [],
            'last_action': None,
            'comparison_products': [],
            'price_filter': None,
            'category_filter': None,
            'last_comparison_type': None,
            'comparison_warning': None,
            'viewing_global': False,
            'global_criteria': None,
        }
        return session