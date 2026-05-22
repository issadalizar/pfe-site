# utils/constants.py
"""Constantes partagées par tous les modules - ÉVITE LES RÉPÉTITIONS"""

# Stopwords multilingues (UNIQUE définition)
STOP_WORDS = {
    'fr': {'de', 'la', 'le', 'les', 'et', 'en', 'un', 'une', 'des', 'du', 'pour',
           'par', 'sur', 'avec', 'dans', 'est', 'vous', 'nous', 'votre'},
    'en': {'the', 'and', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'is', 'are'}
}

# Poids pour le scoring (UNIQUE définition)
SCORING_WEIGHTS = {
    'price': 25,
    'stock': 20,
    'features': 20,
    'rating': 25,
    'popularity': 10
}

# Poids pour la recherche textuelle
SEARCH_WEIGHTS = {
    'name': 10,
    'category': 6,
    'main_category': 4,
    'features': 3,
    'specs': 2,
    'description': 2
}

# Limites par défaut
DEFAULT_LIMIT = 10
MAX_COMPARISON = 3
MAX_HISTORY = 50