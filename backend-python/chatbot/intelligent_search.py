# chatbot/intelligent_search.py
"""
Moteur de recherche intelligent multi-critères.
CORRECTION: suppression de self.text_processor (non initialisé), remplacé par tokenizer interne.
"""

import re


class IntelligentSearch:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self._stopwords = {'de', 'la', 'le', 'les', 'et', 'en', 'un', 'une', 'des',
                           'du', 'pour', 'par', 'sur', 'avec', 'dans', 'the', 'and',
                           'for', 'with', 'of', 'in', 'to', 'a', 'an'}

    def _tokenize(self, text):
        words = re.findall(r'\b\w{2,}\b', text.lower())
        return [w for w in words if w not in self._stopwords]

    def search(self, query, limit=10):
        if not query:
            return []
        q = query.lower().strip()

        # Prix
        if self._is_price_query(q):
            r = self._search_by_price(q)
            if r:
                return r[:limit]

        # Stock
        if self._is_stock_query(q):
            r = self._search_by_stock(q)
            if r:
                return r[:limit]

        # Catégorie explicite
        if self._is_category_query(q):
            r = self._search_by_category(q)
            if r:
                return r[:limit]

        # Features/specs techniques
        if self._is_feature_spec_query(q):
            r = self._search_by_features_and_specs(q)
            if r:
                return r[:limit]

        # Texte libre
        return self._full_text_search(q, limit)

    def _is_price_query(self, q):
        return bool(re.search(
            r'prix|tarif|co[uû]t|cher|abordable|budget|moins de \d+|under \d+|€|\d+\s*euros?', q))

    def _is_stock_query(self, q):
        return bool(re.search(r'stock|disponible|dispo|rupture|[eé]puis[eé]|livraison', q))

    def _is_category_query(self, q):
        return any(cat in q for cat in self.data_loader.get_all_categories())

    def _is_feature_spec_query(self, q):
        tech_kw = [
            'moteur', 'broche', 'vitesse', 'puissance', 'pr[eé]cision', 'cnc', 'tour',
            'fraise', 'capteur', 'injection', 'diagnostic', 'oscilloscope', 'sonde',
            'mesure', 'r[eé]seau', 'can bus', 'r[eé]solution', 'tension', 'courant',
            'fr[eé]quence', 'rpm', 'volt', 'amp[eè]re', 'watt', 'axe'
        ]
        return any(re.search(kw, q) for kw in tech_kw)

    def _search_by_price(self, q):
        products = self.data_loader.get_all_products()

        # Entre X et Y
        m = re.search(r'entre\s*(\d+)\s*(?:et|and|[àa]|-)\s*(\d+)', q)
        if m:
            mn, mx = int(m.group(1)), int(m.group(2))
            return sorted([p for p in products if mn <= p.price <= mx], key=lambda x: x.price)

        # Moins de X
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
        words = [w for w in self._tokenize(q) if len(w) > 2]
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
                    score += 10
                if kw in cat_l:
                    score += 6
                if kw in main_l:
                    score += 4
                if kw in desc_l:
                    score += 2
                for f in p.features:
                    if kw in f.lower():
                        score += 3
                for k, v in {**p.specifications, **p.technicalSpecs}.items():
                    if kw in k.lower() or kw in str(v).lower():
                        score += 2
            if score > 0:
                scored[p.id] = (score, p)

        return [p for _, p in sorted(scored.values(), key=lambda x: x[0], reverse=True)][:limit]