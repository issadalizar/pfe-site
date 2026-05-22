# chatbot/__init__.py
from services.data_loader import ProductDataLoader
from .intelligent_search import IntelligentSearch
from .conversation import ConversationManager
from .recommendation_service import RecommendationService

# Initialisation globale
data_loader = ProductDataLoader()   
data_loader.load_products()
intelligent_search = IntelligentSearch(data_loader)
recommendation_service = RecommendationService(data_loader)  
conversation_manager = ConversationManager()