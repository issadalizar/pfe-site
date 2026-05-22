#importation de la classe datetime pour gérer les timestamps des messages
from datetime import datetime
class ConversationManager:
    def __init__(self):
        self.sessions = {}
# fonction pour récupérer ou créer une session de conversation pour un utilisateur donné
    def get_or_create_session(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = {
                'history': [],
                'context': {
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
            }
        return self.sessions[user_id]
    #fonction d'ajouter un message de l'utilisateur ou du chatbot à l'historique d'une session avec les produits associés
    def add_message(self, user_id, role, content, products=None):
        session = self.get_or_create_session(user_id)
        entry = {
            'role': role,
            'content': content,
            'time': datetime.now().isoformat(),#isoformat() convertir date en chaine caractere 
            'products': products or []
        }
        session['history'].append(entry)

        # teste de si les produits sont associés au message
        if products:
            session['context']['last_products'] = products
        return session
#fonction de mise à jour de conversation de user  avec informations des produits, actions, filtres
    def update_context(self, user_id, **kwargs):
        session = self.get_or_create_session(user_id)
        session['context'].update(kwargs)
#fonction de récupération des derniers produits consultés par l'utilisateur à partir de l'historique de la session
    def get_recent_products(self, user_id, n=6):
        """Récupère les derniers produits consultés par l'utilisateur"""
        session = self.get_or_create_session(user_id)
        products = []
        #Parcourt l'historique à l'envers (du plus récent au plus ancien)
        for msg in reversed(session['history'][-20:]):
            for p in msg.get('products', []):
                if p not in products:#eviter doublons
                    products.append(p)
            if len(products) >= n:
                break
        return products[:n]
#fonction de recupération de historique avec nbre limité de messages
    def get_history(self, user_id, n=10):
        session = self.get_or_create_session(user_id)
        return session['history'][-n:]
#supprimer des sessions pour la reinitialisation ou la gestion de la mémoire
    def clear_session(self, user_id):
        if user_id in self.sessions:
            del self.sessions[user_id]
    #réinitialisation 
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