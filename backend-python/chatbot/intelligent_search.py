# chatbot/intelligent_search.py
import re
from utils.text_processor import TextProcessor  # ← Utiliser le processor central
from utils.constants import SEARCH_WEIGHTS      # ← Poids centralisés

class IntelligentSearch:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.text_processor = TextProcessor()  # ← Plus de stopwords dupliqués
        # PLUS BESOIN de self._stopwords

    def _tokenize(self, text):
        """Délègue au TextProcessor central"""
        return self.text_processor.tokenize(text)

    def search(self, query, limit=10):
        if not query:
            return []
        q = query.lower().strip()

        if self._is_price_query(q):
            r = self._search_by_price(q)
            if r:
                return r[:limit]
        if self._is_stock_query(q):
            r = self._search_by_stock(q)
            if r:
                return r[:limit]
        if self._is_category_query(q):
            r = self._search_by_category(q)
            if r:
                return r[:limit]
        if self._is_feature_spec_query(q):
            r = self._search_by_features_and_specs(q)
            if r:
                return r[:limit]

        return self._full_text_search(q, limit)

    def _search_by_price(self, q):
        products = self.data_loader.get_all_products()

        m = re.search(r'entre\s*(\d+)\s*(?:et|and|[àa]|-)\s*(\d+)', q)
        if m:
            mn, mx = int(m.group(1)), int(m.group(2))
            return sorted([p for p in products if mn <= p.price <= mx], key=lambda x: x.price)

        m = re.search(r'moins de\s*(\d+)|under\s*(\d+)|max(?:imum)?\s*(\d+)|budget\s*(?:de)?\s*(\d+)', q)
        if m:
            val = int(next(g for g in m.groups() if g))
            return sorted([p for p in products if p.price <= val], key=lambda x: x.price)

        if re.search(r'moins cher|abordable|pas cher|[eé]conomique|budget', q):
            return sorted(products, key=lambda x: x.price)[:10]

        if re.search(r'plus cher|haut de gamme|premium|luxe', q):
            return sorted(products, key=lambda x: x.price, reverse=True)[:10]

        return []

    def _search_by_stock(self, q):
        products = self.data_loader.get_all_products()
        if re.search(r'rupture|[eé]puis[eé]|out of stock|pas disponible', q):
            return [p for p in products if p.stock == 0]
        return sorted([p for p in products if p.stock > 0], key=lambda x: x.stock, reverse=True)

    def _search_by_category(self, q):
        results = []
        for cat in self.data_loader.get_all_categories():
            if cat in q:
                for p in self.data_loader.get_products_by_category(cat):
                    if p not in results:
                        results.append(p)
        return results

    def _search_by_features_and_specs(self, q):
        words = self._tokenize(q)
        words = [w for w in words if len(w) > 2]
        scored = {}
        for p in self.data_loader.get_all_products():
            score = 0
            for f in p.features:
                if any(w in f.lower() for w in words):
                    score += 3
            for k, v in p.specifications.items():
                if any(w in k.lower() or w in str(v).lower() for w in words):
                    score += 2
            for k, v in p.technicalSpecs.items():
                if any(w in k.lower() or w in str(v).lower() for w in words):
                    score += 2
            if score > 0:
                scored[p.id] = (score, p)
        return [p for _, p in sorted(scored.values(), key=lambda x: x[0], reverse=True)]

    def _full_text_search(self, q, limit):
        keywords = self._tokenize(q)
        if not keywords:
            keywords = [w for w in q.split() if len(w) > 2]

        scored = {}
        for p in self.data_loader.get_all_products():
            score = 0
            name_l = p.name.lower()
            cat_l = p.category.lower()
            main_l = p.mainCategory.lower()
            desc_l = p.description.lower()

            for kw in keywords:
                if kw in name_l:
                    score += SEARCH_WEIGHTS['name']
                if kw in cat_l:
                    score += SEARCH_WEIGHTS['category']
                if kw in main_l:
                    score += SEARCH_WEIGHTS['main_category']
                if kw in desc_l:
                    score += SEARCH_WEIGHTS['description']
                for f in p.features:
                    if kw in f.lower():
                        score += SEARCH_WEIGHTS['features']
                for k, v in {**p.specifications, **p.technicalSpecs}.items():
                    if kw in k.lower() or kw in str(v).lower():
                        score += SEARCH_WEIGHTS['specs']
            if score > 0:
                scored[p.id] = (score, p)

        return [p for _, p in sorted(scored.values(), key=lambda x: x[0], reverse=True)][:limit]

    def _is_price_query(self, q):
        return bool(re.search(r'prix|tarif|co[uû]t|cher|abordable|budget|moins de \d+|under \d+|€|\d+\s*euros?', q))

    def _is_stock_query(self, q):
        return bool(re.search(r'stock|disponible|dispo|rupture|[eé]puis[eé]|livraison', q))

    def _is_category_query(self, q):
        return any(cat in q for cat in self.data_loader.get_all_categories())

    def _is_feature_spec_query(self, q):
        tech_kw = ['moteur', 'broche', 'vitesse', 'puissance', 'cnc', 'tour', 'fraise', 'capteur']
        return any(re.search(kw, q) for kw in tech_kw)