# chatbot/recommendation_service.py

import re


class RecommendationService:
    def __init__(self, data_loader):
        self.data_loader = data_loader

    def recommend(self, user_input=None, max_results=6):
        """Recommande des produits selon le contexte libre"""
        if not user_input:
            return self._top_rated(max_results)

        user_input_lower = user_input.lower()

        # Budget
        budget = self._extract_budget(user_input_lower)

        # Type de besoin
        if any(w in user_input_lower for w in ['pas cher', 'budget', 'abordable', 'économique', 'moins cher']):
            products = self._by_price('cheap', max_results, budget)
        elif any(w in user_input_lower for w in ['premium', 'luxe', 'haut de gamme', 'professionnel', 'meilleur']):
            products = self._by_price('premium', max_results, budget)
        elif any(w in user_input_lower for w in ['école', 'étudiant', 'enseignement', 'apprendre', 'formation', 'éducation']):
            products = self._for_education(max_results, budget)
        elif any(w in user_input_lower for w in ['cnc', 'tour', 'tournage', 'fraise', 'fraisage']):
            products = self._by_category('cnc', max_results, budget)
        elif any(w in user_input_lower for w in ['voiture', 'auto', 'automobile', 'diagnostic', 'moteur']):
            products = self._by_category('voiture', max_results, budget)
        elif any(w in user_input_lower for w in ['labo', 'laboratoire', 'oscilloscope', 'sonde', 'mesure']):
            products = self._by_category('mcp', max_results, budget)
        elif any(w in user_input_lower for w in ['capteur', 'actionneur', 'capteur', 'position', 'angle']):
            products = self._by_category('capteur', max_results, budget)
        elif any(w in user_input_lower for w in ['populaire', 'top', 'tendance', 'plus vendu']):
            products = self._popular(max_results, budget)
        elif budget:
            # Budget mentionné sans catégorie → filtrer par prix
            all_p = self.data_loader.get_all_products()
            products = sorted(
                [p for p in all_p if p.price <= budget],
                key=lambda x: x.rating, reverse=True
            )[:max_results]
        else:
            # Recherche dans tout le catalogue par mots-clés
            from utils.text_processor import TextProcessor
            tp = TextProcessor()
            keywords = tp.extract_keywords(user_input)
            products = []
            if keywords:
                for p in self.data_loader.get_all_products():
                    text = p.get_searchable_text().lower()
                    if any(kw in text for kw in keywords):
                        products.append(p)
                products = products[:max_results]

            if not products:
                products = self._popular(max_results)

        # Scorer et trier
        return self._score_products(products)[:max_results]

    def _extract_budget(self, text):
        patterns = [
            r'moins de\s*(\d+)',
            r'budget\s*(?:de)?\s*(\d+)',
            r'maximum\s*(\d+)',
            r'(\d+)\s*€',
            r'(\d+)\s*euros?',
        ]
        for p in patterns:
            m = re.search(p, text)
            if m:
                return int(m.group(1))
        return None

    def _score_products(self, products):
        """Trie par score multi-critères"""
        if not products:
            return []
        max_orders = max((p.order_count for p in products), default=1) or 1
        scored = []
        for p in products:
            score = p.rating * 10 + (p.order_count / max_orders) * 5 + (1 if p.stock > 0 else 0) * 3
            scored.append((score, p))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored]

    def _top_rated(self, limit):
        products = self.data_loader.get_all_products()
        return sorted(products, key=lambda x: x.rating, reverse=True)[:limit]

    def _by_price(self, price_type, limit, budget=None):
        products = self.data_loader.get_all_products()
        if budget:
            products = [p for p in products if p.price <= budget]
        if price_type == 'cheap':
            return sorted(products, key=lambda x: x.price)[:limit]
        return sorted(products, key=lambda x: x.price, reverse=True)[:limit]

    def _for_education(self, limit, budget=None):
        products = self.data_loader.get_all_products()
        if budget:
            products = [p for p in products if p.price <= budget]
        edu = [p for p in products if
               'education' in p.mainCategory.lower() or
               'cnc' in p.mainCategory.lower() or
               'formation' in p.description.lower()]
        return edu[:limit] if edu else products[:limit]

    def _by_category(self, cat, limit, budget=None):
        products = self.data_loader.get_all_products()
        if budget:
            products = [p for p in products if p.price <= budget]
        filtered = [p for p in products if
                    cat in p.mainCategory.lower() or
                    cat in p.category.lower() or
                    cat in p.description.lower()]
        return filtered[:limit] if filtered else products[:limit]

    def _popular(self, limit, budget=None):
        products = self.data_loader.get_all_products()
        if budget:
            products = [p for p in products if p.price <= budget]
        return sorted(products, key=lambda x: x.order_count, reverse=True)[:limit]