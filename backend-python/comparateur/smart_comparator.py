# comparateur/smart_comparator.py
from utils.scoring import ScoringService  # ← Importer le scoring centralisé

class SmartComparator:
    def __init__(self, data_loader):
        self.data_loader = data_loader

    def compare(self, products, criteria=None):
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
            'recommendation': self._get_recommendation(products),  # ← Utilise scoring centralisé
        }

        if criteria:
            comparison['highlighted_criteria'] = criteria

        return comparison

    def compare_by_keyword(self, products, keyword):
        if not products or len(products) < 2:
            return None

        keyword_lower = keyword.lower()

        matching_features = {}
        for p in products:
            matches = [f for f in p.features if keyword_lower in f.lower()]
            matching_features[p.name] = matches

        matching_specs = {}
        for p in products:
            matches = {k: v for k, v in p.specifications.items()
                       if keyword_lower in k.lower() or keyword_lower in str(v).lower()}
            matching_specs[p.name] = matches

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

    def _generate_summary(self, products):
        return [{
            'name': p.name, 'price': p.price, 'stock': p.stock,
            'features_count': len(p.features), 'rating': p.rating,
            'orders': p.order_count, 'category': p.category,
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
        all_features = {}
        for p in products:
            for f in p.features:
                if f not in all_features:
                    all_features[f] = {}
                all_features[f][p.name] = True

        for f in all_features:
            for p in products:
                if p.name not in all_features[f]:
                    all_features[f][p.name] = False

        return all_features

    def _compare_specs(self, products):
        all_specs = {}
        for p in products:
            for k, v in p.specifications.items():
                if k not in all_specs:
                    all_specs[k] = {}
                all_specs[k][p.name] = v
            for k, v in p.technicalSpecs.items():
                key = f"[Tech] {k}"
                if key not in all_specs:
                    all_specs[key] = {}
                all_specs[key][p.name] = v

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
        """Utilise le service de scoring centralisé"""
        scored_products = ScoringService.score_products(products)
        
        if not scored_products:
            return None
        
        best = scored_products[0]
        scores = ScoringService.get_scores_dict(products)

        return {
            'best_product': best.name,
            'scores': scores,
            'explanation': self._build_explanation(best, products),
        }

    def _build_explanation(self, best, all_products):
        parts = []
        prices = [p.price for p in all_products]
        if best.price == min(prices):
            parts.append(f"💰 Prix le plus bas : {best.price}€")
        else:
            parts.append(f"💰 Prix : {best.price}€")

        if best.stock > 0:
            parts.append(f"📦 Disponible ({best.stock} en stock)")

        parts.append(f"✅ {len(best.features)} caractéristiques")
        parts.append(f"⭐ Note : {best.rating}/5")

        orders = [p.order_count for p in all_products]
        if best.order_count == max(orders):
            parts.append(f"🔥 Le plus commandé ({best.order_count} fois)")
        elif best.order_count > 0:
            parts.append(f"🛒 {best.order_count} commandes")

        return " | ".join(parts)