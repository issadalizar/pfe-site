# utils/scoring.py
"""Service de scoring centralisé - utilisé par comparator et open_chat_engine"""

from utils.constants import SCORING_WEIGHTS

class ScoringService:
    """TOUTE la logique de scoring en UN SEUL ENDROIT"""
    
    @staticmethod
    def score_products(products):
        """
        Score multi-critères pour classer des produits
        Utilisé par: SmartComparator et OpenChatEngine
        """
        if not products:
            return []
        
        max_price = max(p.price for p in products) or 1
        max_stock = max(p.stock for p in products) or 1
        max_features = max(len(p.features) for p in products) or 1
        max_orders = max(p.order_count for p in products) or 1
        
        scored = []
        for p in products:
            score = 0
            score += (1 - p.price / max_price) * SCORING_WEIGHTS['price']
            score += (p.stock / max_stock) * SCORING_WEIGHTS['stock']
            score += (len(p.features) / max_features) * SCORING_WEIGHTS['features']
            score += p.rating * (SCORING_WEIGHTS['rating'] / 5)
            score += (p.order_count / max_orders) * SCORING_WEIGHTS['popularity']
            scored.append((score, p))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored]
    
    @staticmethod
    def get_scores_dict(products):
        """Retourne un dictionnaire des scores pour l'affichage"""
        if not products:
            return {}
        
        max_price = max(p.price for p in products) or 1
        max_stock = max(p.stock for p in products) or 1
        max_features = max(len(p.features) for p in products) or 1
        max_orders = max(p.order_count for p in products) or 1
        
        scores = {}
        for p in products:
            score = 0
            score += (1 - p.price / max_price) * SCORING_WEIGHTS['price']
            score += (p.stock / max_stock) * SCORING_WEIGHTS['stock']
            score += (len(p.features) / max_features) * SCORING_WEIGHTS['features']
            score += p.rating * (SCORING_WEIGHTS['rating'] / 5)
            score += (p.order_count / max_orders) * SCORING_WEIGHTS['popularity']
            scores[p.name] = round(score, 2)
        
        return scores