# chatbot/__init__.py
from services.data_loader import ProductDataLoader
from .intelligent_search import IntelligentSearch  # Changé: chemin complet
from .conversation import ConversationManager
from .recommendation_service import RecommendationService  # Changé: chemin complet

# Initialisation globale
data_loader = ProductDataLoader()   
data_loader.load_products()  # Charger les produits au démarrage
intelligent_search = IntelligentSearch(data_loader)
recommendation_service = RecommendationService(intelligent_search)  # Utiliser le moteur de recherche pour les recommandations
conversation_manager = ConversationManager()