# comparateur/smart_comparator.py
"""
Comparateur intelligent multi-critères.
Supporte : prix, stock, features (ou mot dans features), specs (ou mot dans specs), orders.
"""


class SmartComparator:
    def __init__(self, data_loader):
        self.data_loader = data_loader

    def compare(self, products, criteria=None):
        """Compare des produits selon plusieurs critères (ou tous si criteria=None)"""
        if not products or len(products) < 2:
            return None

        comparison = {
            'products': [p.to_dict() for p in products],
            'summary': self._generate_summary(products),
            'price_comparison': self._compare_prices(products),
            'stock_comparison': self._compare_stock(products),
            'orders_comparison': self._compare_orders(products),
            'features_comparison': self._compare_features(products),
            'specs_comparison': self._compare_specs(products),
            'best_by_criteria': self._find_best_by_criteria(products, criteria),
            'recommendation': self._get_recommendation(products),
        }

        # Si critère spécifique mentionné, mettre en avant
        if criteria:
            comparison['highlighted_criteria'] = criteria

        return comparison

    def compare_by_keyword(self, products, keyword):
        """Compare des produits en mettant en avant les features/specs contenant le mot-clé"""
        if not products or len(products) < 2:
            return None

        keyword_lower = keyword.lower()

        # Features contenant le mot-clé
        matching_features = {}
        for p in products:
            matches = [f for f in p.features if keyword_lower in f.lower()]
            matching_features[p.name] = matches

        # Specs contenant le mot-clé
        matching_specs = {}
        for p in products:
            matches = {k: v for k, v in p.specifications.items()
                       if keyword_lower in k.lower() or keyword_lower in str(v).lower()}
            matching_specs[p.name] = matches

        # TechnicalSpecs contenant le mot-clé
        matching_tech = {}
        for p in products:
            matches = {k: v for k, v in p.technicalSpecs.items()
                       if keyword_lower in k.lower() or keyword_lower in str(v).lower()}
            matching_tech[p.name] = matches

        result = self.compare(products)
        if result:
            result['keyword_features'] = matching_features
            result['keyword_specs'] = matching_specs
            result['keyword_tech_specs'] = matching_tech
        return result
    
    def get_global_stats(self):
        """Retourne des statistiques globales sur tous les produits"""
        products = self.data_loader.get_all_products()
        
        if not products:
            return {}
        
        prices = [p.price for p in products]
        
        return {
            'total_products': len(products),
            'total_categories': len(set(p.category for p in products)),
            'price': {
                'avg': sum(prices) / len(prices),
                'min': min(prices),
                'max': max(prices),
                'distribution': {
                    'cheap': sum(1 for p in products if p.price < sum(prices)/len(prices) * 0.7),
                    'medium': sum(1 for p in products if sum(prices)/len(prices) * 0.7 <= p.price <= sum(prices)/len(prices) * 1.3),
                    'expensive': sum(1 for p in products if p.price > sum(prices)/len(prices) * 1.3)
                }
            },
            'stock': {
                'total': sum(p.stock for p in products),
                'in_stock': sum(1 for p in products if p.stock > 0),
                'out_of_stock': sum(1 for p in products if p.stock == 0)
            },
            'orders': {
                'total': sum(p.order_count for p in products),
                'avg_per_product': sum(p.order_count for p in products) / len(products)
            },
            'ratings': {
                'avg': sum(p.rating for p in products) / len(products),
                'best_rated': max(p.rating for p in products)
            }
        }

    def _generate_summary(self, products):
        return [{
            'name': p.name,
            'price': p.price,
            'stock': p.stock,
            'features_count': len(p.features),
            'rating': p.rating,
            'orders': p.order_count,
            'category': p.category,
        } for p in products]

    def _find_best_by_criteria(self, products, criteria):
        if not criteria:
            return None
        criteria = criteria.lower()

        if any(w in criteria for w in ['prix', 'price', 'cher', 'abordable', 'budget']):
            return min(products, key=lambda x: x.price).name
        if any(w in criteria for w in ['stock', 'disponible', 'dispo']):
            return max(products, key=lambda x: x.stock).name
        if any(w in criteria for w in ['feature', 'caractéristique', 'fonctionnalité']):
            return max(products, key=lambda x: len(x.features)).name
        if any(w in criteria for w in ['note', 'rating', 'avis']):
            return max(products, key=lambda x: x.rating).name
        if any(w in criteria for w in ['commande', 'order', 'vendu', 'acheté', 'populaire']):
            return max(products, key=lambda x: x.order_count).name
        return None

    def _compare_prices(self, products):
        prices = {p.name: p.price for p in products}
        cheapest = min(prices.items(), key=lambda x: x[1])
        most_expensive = max(prices.items(), key=lambda x: x[1])
        return {
            'prices': prices,
            'cheapest': cheapest[0],
            'most_expensive': most_expensive[0],
            'average': sum(prices.values()) / len(prices),
            'difference': most_expensive[1] - cheapest[1],
        }

    def _compare_features(self, products):
        """Compare les features — identifie les exclusives et communes"""
        all_features = {}
        for p in products:
            for f in p.features:
                if f not in all_features:
                    all_features[f] = {}
                all_features[f][p.name] = True

        # Compléter avec False pour produits sans cette feature
        for f in all_features:
            for p in products:
                if p.name not in all_features[f]:
                    all_features[f][p.name] = False

        return all_features

    def _compare_specs(self, products):
        """Compare toutes les spécifications"""
        all_specs = {}
        for p in products:
            # specifications
            for k, v in p.specifications.items():
                if k not in all_specs:
                    all_specs[k] = {}
                all_specs[k][p.name] = v
            # technicalSpecs
            for k, v in p.technicalSpecs.items():
                key = f"[Tech] {k}"
                if key not in all_specs:
                    all_specs[key] = {}
                all_specs[key][p.name] = v

        # Compléter avec N/A
        for spec in all_specs:
            for p in products:
                if p.name not in all_specs[spec]:
                    all_specs[spec][p.name] = 'N/A'

        return all_specs

    def _compare_stock(self, products):
        return {p.name: p.stock for p in products}

    def _compare_orders(self, products):
        return {p.name: p.order_count for p in products}

    def _get_recommendation(self, products):
        """Score multi-critères pour trouver le meilleur produit"""
        max_price = max(p.price for p in products) or 1
        max_stock = max(p.stock for p in products) or 1
        max_features = max(len(p.features) for p in products) or 1
        max_orders = max(p.order_count for p in products) or 1

        scores = {}
        for p in products:
            score = 0
            score += (1 - p.price / max_price) * 25       # Prix : moins cher = mieux
            score += (p.stock / max_stock) * 20            # Stock disponible
            score += (len(p.features) / max_features) * 20 # Richesse fonctionnelle
            score += p.rating * 5                          # Note /5 * 5 = max 25
            score += (p.order_count / max_orders) * 10    # Popularité
            scores[p.name] = round(score, 2)

        best_name = max(scores.items(), key=lambda x: x[1])[0]
        best = next(p for p in products if p.name == best_name)

        return {
            'best_product': best_name,
            'scores': scores,
            'explanation': self._build_explanation(best, products),
        }

    def _build_explanation(self, best, all_products):
        """Génère une explication claire de la recommandation"""
        parts = []

        # Prix
        prices = [p.price for p in all_products]
        if best.price == min(prices):
            parts.append(f"💰 Prix le plus bas : {best.price}€")
        else:
            parts.append(f"💰 Prix : {best.price}€")

        # Stock
        if best.stock > 0:
            parts.append(f"📦 Disponible ({best.stock} en stock)")
        
        # Features
        parts.append(f"✅ {len(best.features)} caractéristiques")

        # Rating
        parts.append(f"⭐ Note : {best.rating}/5")

        # Orders
        orders = [p.order_count for p in all_products]
        if best.order_count == max(orders):
            parts.append(f"🔥 Le plus commandé ({best.order_count} fois)")
        elif best.order_count > 0:
            parts.append(f"🛒 {best.order_count} commandes")

        return " | ".join(parts)