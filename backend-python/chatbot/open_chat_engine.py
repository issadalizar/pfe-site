# chatbot/open_chat_engine.py
"""
Moteur de conversation OUVERTE.
Aucune restriction par patterns fixes.
Comprend le langage naturel via extraction de mots-clés et contexte.
VERSION 6 : Correction des critères de comparaison
"""

import re
from utils.text_processor import TextProcessor


class OpenChatEngine:
    def __init__(self, data_loader, search_engine, comparator, recommendation_service):
        self.data_loader = data_loader
        self.search_engine = search_engine
        self.comparator = comparator
        self.recommendation_service = recommendation_service
        self.text_processor = TextProcessor()

        self.COMPARISON_SIGNALS = [
            'compar', 'vs', 'versus', 'différence', 'diff', 'lequel', 'laquelle',
            'mieux', 'meilleur entre', 'entre', 'ou bien', 'ou le', 'choisir entre',
            'opposition', 'face à', 'contre', 'préfère', 'avantage', 'inconvénient'
        ]
        self.RECOMMENDATION_SIGNALS = [
            'conseil', 'recommande', 'suggère', 'propose', 'idéal', 'parfait',
            'meilleur choix', 'quel produit', 'lequel choisir', 'pour moi',
            'besoin', 'cherche quelque chose', 'adapté', 'convient', 'que choisir',
            'aide moi', 'aider', 'guide', 'orienter', 'diriger'
        ]
        self.PRICE_SIGNALS = [
            'prix', 'tarif', 'coût', 'cout', 'combien', '€', 'euro', 'cher',
            'abordable', 'budget', 'pas cher', 'bon marché', 'economique',
            'économique', 'moins de', 'under', 'moins cher', 'plus cher',
            'haut de gamme', 'premium', 'luxe', 'affordable'
        ]
        self.STOCK_SIGNALS = [
            'stock', 'disponible', 'dispo', 'livrable', 'en stock', 'rupture',
            'épuisé', 'epuise', 'availability', 'available', 'livraison', 'commande'
        ]
        self.ORDER_SIGNALS = [
            'populaire', 'plus vendu', 'plus commandé', 'tendance', 'top',
            'best seller', 'bestseller', 'meilleure vente', 'plus acheté',
            'demandé', 'préféré', 'choix client', 'avis client', 'order'
        ]
        self.SPEC_SIGNALS = [
            'specification', 'spécification', 'spec', 'technique', 'caractéristique',
            'feature', 'fonction', 'capacité', 'puissance', 'vitesse', 'dimension',
            'taille', 'poids', 'matériau', 'matiere', 'composant', 'moteur',
            'broche', 'cnc', 'tour', 'fraise', 'capteur', 'injection', 'diagnostic',
            'oscilloscope', 'sonde', 'mesure', 'résolution', 'précision', 'tension',
            'courant', 'fréquence', 'rpm', 'mm', 'kg', 'volt', 'ampere', 'watt'
        ]
        self.LIST_SIGNALS = [
            'liste', 'list', 'tous les', 'toutes les', 'catalogue', 'catalogue',
            'affiche', 'montre', 'voir tous', 'voir toutes', 'menu', 'rayon',
            'catégorie', 'categorie', 'quels produits', 'quelles produits',
            'avez-vous', 'as-tu', 'proposez-vous', 'gamme', 'collection'
        ]
        self.GREETING_SIGNALS = [
            'bonjour', 'bonsoir', 'salut', 'coucou', 'hello', 'hi', 'hey',
            'bon matin', 'bonne journée', 'good morning', 'good evening'
        ]

    def process(self, message: str, session: dict) -> dict:
        msg_lower = message.lower().strip()
        history = session.get('history', [])
        context = session.get('context', {})

        # --- 0. Traitement des questions simples avec "est-ce que" ---
        if msg_lower.startswith('est-ce que') or msg_lower.startswith("est ce que"):
            # Transformer en requête de recherche
            query = msg_lower.replace('est-ce que', '').replace('est ce que', '').strip()
            return self._handle_free_search(message, query, context, history)

        # --- 1. Salutations ---
        if self._has_signal(msg_lower, self.GREETING_SIGNALS) and len(msg_lower.split()) <= 5:
            return self._greeting_response(history)

        # --- 2. Questions sur le chatbot lui-même ---
        if any(phrase in msg_lower for phrase in ['qui es-tu', 'tu es qui', 'c\'est quoi', 'ton nom', 't\'appelles']):
            return self._identity_response()

        # --- 3. Remerciements / Au revoir ---
        if any(w in msg_lower for w in ['merci', 'thanks', 'thank you']):
            return {'response': "De rien ! N'hésitez pas si vous avez d'autres questions. 😊", 'products': [], 'action': 'chat'}
        if any(w in msg_lower for w in ['au revoir', 'bye', 'à bientôt', 'adieu']):
            return {'response': "Au revoir ! À bientôt ! 👋", 'products': [], 'action': 'chat'}

        # --- 4. Aide ---
        if any(w in msg_lower for w in ['aide', 'help', 'comment utiliser', 'que peux-tu', 'que sais tu faire']):
            return {'response': self._help_message(), 'products': [], 'action': 'chat'}

        # --- 5. Détection des intentions de comparaison ---
        intent_type, products, criteria = self._detect_comparison_intent(msg_lower, history, context)
        if intent_type:
            return self._handle_comparison_with_intent(intent_type, products, criteria, context, history)

        # --- 6. Liste des catégories ---
        if self._is_category_list_request(msg_lower):
            return self._list_categories()

        # --- 7. Requête spécifique de catégorie ---
        category_result = self._handle_category_query(message, session)
        if category_result:
            return category_result

        # --- 8. Liste de tous les produits ---
        if self._is_product_list_request(msg_lower) and not self._has_specific_product_context(msg_lower):
            return self._list_all_products()

        # --- 9. Recommandation ---
        if self._has_signal(msg_lower, self.RECOMMENDATION_SIGNALS):
            return self._handle_recommendation(message, msg_lower, context)

        # --- 10. Recherche par prix ---
        if self._has_signal(msg_lower, self.PRICE_SIGNALS):
            return self._handle_price_query(message, msg_lower)

        # --- 11. Recherche par stock ---
        if self._has_signal(msg_lower, self.STOCK_SIGNALS):
            return self._handle_stock_query(msg_lower)

        # --- 12. Recherche par popularité ---
        if self._has_signal(msg_lower, self.ORDER_SIGNALS):
            return self._handle_order_query(msg_lower)

        # --- 13. Recherche par spec/feature ---
        if self._has_signal(msg_lower, self.SPEC_SIGNALS):
            return self._handle_feature_spec_query(message, msg_lower)

        # --- 14. Recherche générale ---
        return self._handle_free_search(message, msg_lower, context, history)

    # ================================================================
    # DÉTECTION DES INTENTIONS
    # ================================================================

    def _has_signal(self, text, signals):
        return any(s in text for s in signals)

    def _is_category_list_request(self, msg_lower):
        cat_words = ['catégorie', 'categorie', 'categories', 'rayon', 'section', 'type de produit', 'types de produit']
        if self._is_product_list_request(msg_lower):
            return False
        return any(w in msg_lower for w in cat_words)

    def _is_product_list_request(self, msg_lower):
        triggers = [
            'tous les produits', 'toutes les produits', 'catalogue complet',
            'liste des produits', 'liste produits', 'liste de produits',
            'voir tous les produits', 'affiche les produits', 'montre les produits',
            'tous produits', 'voir produits', 'afficher produits',
            'all products', 'list products', 'show products'
        ]
        return any(t in msg_lower for t in triggers)

    def _has_specific_product_context(self, msg_lower):
        product_words = ['cnc', 'tour', 'fraise', 'capteur', 'oscilloscope', 'voiture', 'auto',
                         'mcp', 'labo', 'éducatif', 'education', 'milling', 'turning', 'de2', 'pc1',
                         'fa2', 'px1', 'dt-', 'dtm', 'mt-', 'ptl', 'acl', 'f1-']
        return any(p in msg_lower for p in product_words)

    def _detect_comparison_intent(self, msg_lower, history, context):
        """
        Détection avancée des intentions de comparaison
        Retourne : (type_comparaison, cible, criteres)
        """
        # CAS SPÉCIAL: "comparer tous selon prix" ou "comparer tous les produits selon stock"
        match = re.search(r'comparer tous(?:\s+les\s+produits)?\s+(?:selon|par|sur)\s+([a-zéèêëàâîïôûç]+)', msg_lower)
        if match:
            criteria = match.group(1).strip().lower()
            # Normaliser le critère
            criteria = self._normalize_criteria(criteria)
            return ('compare_all_by_criteria', None, criteria)
        
        # CAS SPÉCIAL: "comparer tous" ou "comparer tous les produits"
        if any(phrase in msg_lower for phrase in ['comparer tous', 'compare tous', 'comparer tout', 'compare tout']):
            return ('compare_all_catalog', None, None)
        
        # Cas 1: Comparaison explicite de produits nommés
        products_mentioned = self._extract_product_names(msg_lower)
        if len(products_mentioned) >= 2:
            # Vérifier s'il y a un critère dans la phrase
            criteria = self._extract_comparison_criteria(msg_lower)
            if criteria:
                return ('specific_products_with_criteria', products_mentioned[:3], criteria)
            return ('specific_products', products_mentioned[:3], None)
        
        # Cas 2: Comparaison avec "ces produits" / "tous ces produits"
        if any(phrase in msg_lower for phrase in ['ces produits', 'tous ces produits', 'les comparer', 'comparer ces']):
            # Récupérer les produits du contexte récent
            recent_products = context.get('last_products', [])
            
            if recent_products:
                # Vérifier s'il y a un critère
                criteria = self._extract_comparison_criteria(msg_lower)
                
                if len(recent_products) > 3:
                    context['comparison_warning'] = f"J'ai limité la comparaison aux 3 premiers produits pour plus de clarté."
                    if criteria:
                        return ('context_products_with_criteria', recent_products[:3], criteria)
                    return ('context_products', recent_products[:3], None)
                elif len(recent_products) >= 2:
                    if criteria:
                        return ('context_products_with_criteria', recent_products, criteria)
                    return ('context_products', recent_products, None)
        
        # Cas 3: Comparaison avec critère spécifique sans produits mentionnés
        criteria = self._extract_comparison_criteria(msg_lower)
        if criteria:
            # Chercher dans le contexte
            if context.get('last_products') and len(context.get('last_products')) >= 2:
                recent = context.get('last_products')
                if len(recent) > 3:
                    context['comparison_warning'] = f"J'ai limité la comparaison aux 3 premiers produits."
                    return ('context_products_with_criteria', recent[:3], criteria)
                return ('context_products_with_criteria', recent, criteria)
            else:
                # Pas de produits en contexte, proposer d'en chercher
                return ('criteria_without_products', None, criteria)
        
        # Cas 4: Demande du meilleur produit
        if any(word in msg_lower for word in ['meilleur', 'top', 'lequel', 'choisir', 'gagnant']):
            products_source = products_mentioned if products_mentioned else context.get('last_products', [])
            if products_source:
                # Vérifier s'il y a un critère
                criteria = self._extract_comparison_criteria(msg_lower)
                if len(products_source) > 3:
                    context['comparison_warning'] = f"Analyse des 3 premiers produits pour trouver le meilleur."
                    return ('find_best', products_source[:3], criteria)
                return ('find_best', products_source, criteria)
        
        return None, None, None

    def _normalize_criteria(self, criteria):
        """Normalise les critères de comparaison"""
        criteria = criteria.lower()
        
        # Prix
        if any(word in criteria for word in ['prix', 'tarif', 'cout', 'coût', 'price', 'cher']):
            return 'prix'
        
        # Stock
        if any(word in criteria for word in ['stock', 'disponible', 'dispo', 'rupture']):
            return 'stock'
        
        # Popularité / Commandes
        if any(word in criteria for word in ['order', 'commande', 'populaire', 'vendu', 'acheté', 'popularité']):
            return 'order'
        
        # Spécifications techniques
        if any(word in criteria for word in ['spec', 'spécification', 'technique', 'tech', 'caractéristique technique']):
            return 'spec'
        
        # Caractéristiques / Features
        if any(word in criteria for word in ['caractéristique', 'feature', 'fonction', 'caracteristique']):
            return 'caracteristique'
        
        # Si c'est un mot spécifique (pour recherche par mot-clé)
        if len(criteria) > 2:
            return criteria
        
        return None

    def _extract_product_names(self, msg_lower):
        """Extrait les noms de produits mentionnés dans le message"""
        products_found = []
        all_products = self.data_loader.get_all_products()
        
        # Trier par longueur de nom (longueur décroissante) pour éviter les sous-chaînes
        sorted_products = sorted(all_products, key=lambda x: len(x.name), reverse=True)
        
        for product in sorted_products:
            name_lower = product.name.lower()
            if name_lower in msg_lower and product not in products_found:
                # Vérifier que c'est bien un nom complet (entouré d'espaces ou de ponctuation)
                pattern = r'\b' + re.escape(name_lower) + r'\b'
                if re.search(pattern, msg_lower):
                    products_found.append(product)
        
        return products_found

    def _extract_comparison_criteria(self, msg_lower):
        """
        Extrait le critère de comparaison
        """
        # Patterns pour "comparer selon X" ou "comparer par X"
        match = re.search(r'(?:comparer|compare|selon|par|sur)\s+(?:selon|par|sur)?\s*(le|la|les)?\s*([a-zéèêëàâîïôûç]{3,})', msg_lower)
        if match:
            criteria = match.group(2) if match.group(2) else match.group(1)
            return self._normalize_criteria(criteria)
        
        # Mots-clés directs
        if any(word in msg_lower for word in ['prix', 'tarif', 'cout', 'coût']):
            return 'prix'
        if any(word in msg_lower for word in ['stock', 'disponible', 'dispo']):
            return 'stock'
        if any(word in msg_lower for word in ['populaire', 'commande', 'vendu', 'order']):
            return 'order'
        if any(word in msg_lower for word in ['spec', 'technique', 'spécification']):
            return 'spec'
        if any(word in msg_lower for word in ['caractéristique', 'feature', 'fonction']):
            return 'caracteristique'
        
        return None

    def _extract_price_constraint(self, msg_lower):
        patterns = [
            r'moins de (\d+)',
            r'maximum (\d+)',
            r'max (\d+)',
            r'under (\d+)',
            r'(\d+)\s*€',
            r'budget.*?(\d+)',
            r'(\d+)\s*euros?',
        ]
        for p in patterns:
            m = re.search(p, msg_lower)
            if m:
                return {'max': int(m.group(1))}

        range_m = re.search(r'entre\s*(\d+)\s*(?:et|and|à|-)\s*(\d+)', msg_lower)
        if range_m:
            return {'min': int(range_m.group(1)), 'max': int(range_m.group(2))}

        return None

    # ================================================================
    # GESTIONNAIRES DE COMPARAISON
    # ================================================================

    def _handle_comparison_with_intent(self, intent_type, products, criteria, context, history):
        """Gestionnaire unifié pour tous les cas de comparaison"""
        
        # CAS SPÉCIAL: Critère sans produits
        if intent_type == 'criteria_without_products':
            return {
                'response': (
                    "**⚠️ Je ne vois pas quels produits comparer.**\n\n"
                    "Pour comparer selon ce critère, vous pouvez :\n"
                    "• Chercher d'abord des produits : *affiche les tours CNC*\n"
                    "• Comparer tout le catalogue : *comparer tous selon le prix*\n"
                    "• Nommer des produits : *compare De2-Ultra et PC1 Baby selon le prix*\n\n"
                    "Que souhaitez-vous faire ?"
                ),
                'products': [],
                'action': 'chat'
            }
        
        # CAS SPÉCIAL: Comparer TOUS les produits par critère spécifique
        if intent_type == 'compare_all_by_criteria':
            if not criteria:
                return self._compare_all_products_in_catalog()
            return self._compare_all_products_by_criteria(criteria)
        
        # CAS SPÉCIAL: Comparer TOUS les produits du catalogue
        if intent_type == 'compare_all_catalog':
            return self._compare_all_products_in_catalog()
        
        # Cas 1: Pas assez de produits pour comparer
        if not products or len(products) < 2:
            # Essayer de récupérer depuis l'historique
            recent_products = self._get_recent_products_from_history(history)
            if len(recent_products) >= 2:
                products = recent_products[:3]
            else:
                return self._insufficient_products_response()
        
        # Limiter à 3 produits max pour la comparaison
        products = products[:3]
        
        # Récupérer le message d'avertissement s'il existe
        warning_msg = context.get('comparison_warning', '')
        if warning_msg:
            # Effacer le warning après l'avoir récupéré
            context['comparison_warning'] = ''
        
        # Mettre à jour le contexte avec ces produits
        if products:
            context['last_products'] = products
        
        # Traitement selon le type d'intention
        result = None
        if intent_type in ['specific_products', 'context_products']:
            # Comparaison détaillée complète
            result = self._detailed_comparison(products)
            
        elif intent_type in ['specific_products_with_criteria', 'context_products_with_criteria']:
            # Comparaison selon critère spécifique
            if criteria == 'prix':
                result = self._price_comparison(products)
            elif criteria == 'stock':
                result = self._stock_comparison(products)
            elif criteria == 'spec':
                result = self._specs_comparison(products)
            elif criteria == 'caracteristique':
                result = self._features_comparison(products)
            elif criteria == 'order':
                result = self._popularity_comparison(products)
            else:
                # Critère libre (mot-clé dans specs/features)
                result = self._keyword_comparison(products, criteria)
                
        elif intent_type == 'find_best':
            # Trouver le meilleur produit selon critère
            result = self._best_product_comparison(products, criteria)
        
        # Fallback: comparaison standard
        if not result:
            result = self._standard_comparison(products)
        
        # Ajouter le message d'avertissement si nécessaire
        if warning_msg and result:
            result['response'] = f"⚠️ *{warning_msg}*\n\n{result['response']}"
        
        return result

    def _compare_all_products_in_catalog(self):
        """Compare TOUS les produits du catalogue de façon synthétique"""
        all_products = self.data_loader.get_all_products()
        
        if not all_products:
            return {
                'response': "Aucun produit dans le catalogue.",
                'products': [],
                'action': 'chat'
            }
        
        total = len(all_products)
        categories = set(p.category for p in all_products)
        
        response = f"**📊 COMPARAISON GLOBALE DU CATALOGUE**\n"
        response += f"**{total} produits** répartis dans **{len(categories)} catégories**\n\n"
        response += "─" * 40 + "\n\n"
        
        # 1. STATISTIQUES GÉNÉRALES
        prices = [p.price for p in all_products]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        
        response += "**📈 STATISTIQUES GÉNÉRALES**\n"
        response += f"• Prix moyen : **{avg_price:.0f}€**\n"
        response += f"• Prix minimum : **{min_price:.0f}€**\n"
        response += f"• Prix maximum : **{max_price:.0f}€**\n"
        response += f"• Total stocks : **{sum(p.stock for p in all_products)}** unités\n\n"
        
        # 2. TOP PRIX
        response += "**💰 TOP 5 PRIX**\n"
        response += "─" * 30 + "\n"
        
        # Moins chers
        cheapest = sorted(all_products, key=lambda x: x.price)[:5]
        response += "**Les moins chers :**\n"
        for i, p in enumerate(cheapest, 1):
            stock_icon = "✅" if p.stock > 0 else "❌"
            response += f"{i}. {stock_icon} **{p.name}** — **{p.price}€** | {p.category}\n"
        
        # Plus chers
        expensive = sorted(all_products, key=lambda x: x.price, reverse=True)[:5]
        response += "\n**Les plus chers :**\n"
        for i, p in enumerate(expensive, 1):
            stock_icon = "✅" if p.stock > 0 else "❌"
            response += f"{i}. {stock_icon} **{p.name}** — **{p.price}€** | {p.category}\n"
        
        response += "\n"
        
        # 3. TOP POPULARITÉ
        response += "**🔥 TOP 5 PLUS COMMANDÉS**\n"
        response += "─" * 30 + "\n"
        popular = sorted(all_products, key=lambda x: x.order_count, reverse=True)[:5]
        for i, p in enumerate(popular, 1):
            response += f"{i}. **{p.name}** — {p.order_count} commandes | {p.price}€ | ⭐{p.rating}\n"
        response += "\n"
        
        # 4. TOP NOTES
        response += "**⭐ TOP 5 MIEUX NOTÉS**\n"
        response += "─" * 30 + "\n"
        rated = sorted(all_products, key=lambda x: x.rating, reverse=True)[:5]
        for i, p in enumerate(rated, 1):
            response += f"{i}. **{p.name}** — ⭐{p.rating}/5 | {p.price}€ | 📦{p.stock}\n"
        response += "\n"
        
        # 5. TOP STOCK
        response += "**📦 TOP 5 MIEUX APPROVISIONNÉS**\n"
        response += "─" * 30 + "\n"
        stocked = sorted(all_products, key=lambda x: x.stock, reverse=True)[:5]
        for i, p in enumerate(stocked, 1):
            response += f"{i}. **{p.name}** — {p.stock} unités | {p.price}€\n"
        response += "\n"
        
        # 6. MEILLEUR RAPPORT QUALITÉ/PRIX
        response += "**🏆 TOP 3 MEILLEUR RAPPORT QUALITÉ/PRIX**\n"
        response += "─" * 30 + "\n"
        
        # Calculer un score qualité/prix
        scored = []
        for p in all_products:
            if p.price > 0:
                # Score = (rating * 10 + order_count/100) / price * 1000
                popularity_score = min(p.order_count / 100, 10)  # Max 10 points
                quality_score = p.rating * 10  # Max 50 points (5*10)
                total_score = (quality_score + popularity_score) / p.price * 1000
                scored.append((total_score, p))
        
        best_value = sorted(scored, key=lambda x: x[0], reverse=True)[:3]
        for i, (score, p) in enumerate(best_value, 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
            response += f"{medal} **{p.name}** — {p.price}€ | ⭐{p.rating} | 📦{p.stock}\n"
        response += "\n"
        
        # 7. PAR CATÉGORIE - Meilleur de chaque catégorie
        response += "**📋 MEILLEUR PAR CATÉGORIE**\n"
        response += "─" * 30 + "\n"
        
        categories_dict = {}
        for p in all_products:
            if p.category not in categories_dict:
                categories_dict[p.category] = []
            categories_dict[p.category].append(p)
        
        for category, prods in list(categories_dict.items())[:8]:  # Limiter à 8 catégories
            if prods:
                best_in_cat = max(prods, key=lambda x: x.rating * 10 + x.order_count/100)
                response += f"• **{category}** : {best_in_cat.name} — {best_in_cat.price}€ | ⭐{best_in_cat.rating}\n"
        
        response += "\n" + "─" * 40 + "\n"
        response += "💡 **Pour affiner votre analyse** :\n"
        response += "• *comparer tous selon le prix* (analyse détaillée des prix)\n"
        response += "• *comparer tous selon le stock* (analyse des stocks)\n"
        response += "• *comparer tous selon la popularité* (commandes et notes)\n"
        response += "• *comparer tous selon les caractéristiques* (analyse des features)\n"
        response += "• *comparer tous selon les spécifications* (analyse des specs techniques)\n"
        
        return {
            'response': response,
            'products': all_products[:10],
            'action': 'show_global_comparison',
            'comparison_type': 'global'
        }

    def _compare_all_products_by_criteria(self, criteria):
        """Compare TOUS les produits du catalogue selon un critère spécifique"""
        all_products = self.data_loader.get_all_products()
        
        if not all_products:
            return {
                'response': "Aucun produit dans le catalogue.",
                'products': [],
                'action': 'chat'
            }
        
        total = len(all_products)
        
        response = f"**📊 COMPARAISON GLOBALE - CRITÈRE : {criteria.upper()}**\n"
        response += f"Analyse de **{total} produits**\n\n"
        response += "─" * 40 + "\n\n"
        
        # 1. COMPARAISON PAR PRIX
        if criteria == 'prix':
            response += self._format_price_global_comparison(all_products)
        
        # 2. COMPARAISON PAR STOCK
        elif criteria == 'stock':
            response += self._format_stock_global_comparison(all_products)
        
        # 3. COMPARAISON PAR POPULARITÉ (ORDER)
        elif criteria == 'order':
            response += self._format_popularity_global_comparison(all_products)
        
        # 4. COMPARAISON PAR CARACTÉRISTIQUES
        elif criteria == 'caracteristique':
            response += self._format_features_global_comparison(all_products)
        
        # 5. COMPARAISON PAR SPÉCIFICATIONS TECHNIQUES
        elif criteria == 'spec':
            response += self._format_specs_global_comparison(all_products)
        
        # 6. CRITÈRE NON RECONNU (traité comme mot-clé)
        else:
            # Rechercher les produits contenant ce mot-clé
            matching_products = []
            for p in all_products:
                # Chercher dans les features
                for f in p.features:
                    if criteria in f.lower():
                        matching_products.append(p)
                        break
                else:
                    # Chercher dans les specs
                    for k, v in {**p.specifications, **p.technicalSpecs}.items():
                        if criteria in k.lower() or criteria in str(v).lower():
                            matching_products.append(p)
                            break
            
            if matching_products:
                response += f"**🔍 PRODUITS CONTENANT « {criteria} »**\n"
                response += f"{len(matching_products)} produits trouvés\n\n"
                
                for i, p in enumerate(matching_products[:10], 1):
                    response += f"{i}. **{p.name}** — {p.price}€ | {p.category}\n"
                    # Trouver la feature/spec correspondante
                    for f in p.features:
                        if criteria in f.lower():
                            response += f"   ✓ {f[:60]}...\n"
                            break
                    for k, v in p.specifications.items():
                        if criteria in k.lower() or criteria in str(v).lower():
                            response += f"   ✓ {k}: {v}\n"
                            break
                    response += "\n"
            else:
                response += f"❌ Aucun produit ne contient « {criteria} » dans ses caractéristiques.\n\n"
                response += "**Suggestions :**\n"
                response += "• Vérifiez l'orthographe\n"
                response += "• Essayez un terme plus général\n"
                response += "• Consultez les catégories disponibles\n"
        
        response += "\n" + "─" * 40 + "\n"
        response += "💡 **Autres analyses** :\n"
        response += "• *comparer tous* (vue d'ensemble complète)\n"
        response += "• *comparer tous selon le prix* (analyse des prix)\n"
        response += "• *comparer tous selon le stock* (analyse des stocks)\n"
        
        return {
            'response': response,
            'products': all_products[:10],
            'action': 'show_global_comparison',
            'comparison_type': f'global_{criteria}'
        }

    def _format_price_global_comparison(self, products):
        """Formatte la comparaison globale des prix"""
        response = "**💰 ANALYSE DES PRIX**\n\n"
        
        # Statistiques
        prices = [p.price for p in products]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        
        response += f"• **Prix moyen** : {avg_price:.0f}€\n"
        response += f"• **Prix minimum** : {min_price:.0f}€\n"
        response += f"• **Prix maximum** : {max_price:.0f}€\n\n"
        
        # Distribution des prix
        cheap_count = sum(1 for p in products if p.price < avg_price * 0.7)
        medium_count = sum(1 for p in products if avg_price * 0.7 <= p.price <= avg_price * 1.3)
        expensive_count = sum(1 for p in products if p.price > avg_price * 1.3)
        
        response += "**Distribution :**\n"
        response += f"• Entrée de gamme (<{avg_price*0.7:.0f}€) : {cheap_count} produits\n"
        response += f"• Milieu de gamme : {medium_count} produits\n"
        response += f"• Haut de gamme (>{avg_price*1.3:.0f}€) : {expensive_count} produits\n\n"
        
        # Top 5 moins chers
        cheapest = sorted(products, key=lambda x: x.price)[:5]
        response += "**🏷️ TOP 5 MOINS CHERS**\n"
        for i, p in enumerate(cheapest, 1):
            stock_icon = "✅" if p.stock > 0 else "❌"
            response += f"{i}. {stock_icon} **{p.name}** — **{p.price}€** | {p.category}\n"
        
        # Top 5 plus chers
        expensive = sorted(products, key=lambda x: x.price, reverse=True)[:5]
        response += "\n**💎 TOP 5 PLUS CHERS**\n"
        for i, p in enumerate(expensive, 1):
            stock_icon = "✅" if p.stock > 0 else "❌"
            response += f"{i}. {stock_icon} **{p.name}** — **{p.price}€** | {p.category}\n"
        
        # Meilleur rapport qualité/prix
        response += "\n**🏆 MEILLEUR RAPPORT QUALITÉ/PRIX**\n"
        scored = []
        for p in products:
            if p.price > 0:
                quality_score = p.rating * 10 + min(p.order_count / 100, 10)
                value_score = quality_score / p.price * 1000
                scored.append((value_score, p))
        
        best_value = sorted(scored, key=lambda x: x[0], reverse=True)[:3]
        for i, (score, p) in enumerate(best_value, 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
            response += f"{medal} **{p.name}** — {p.price}€ | ⭐{p.rating}\n"
        
        return response

    def _format_stock_global_comparison(self, products):
        """Formatte la comparaison globale des stocks"""
        response = "**📦 ANALYSE DES STOCKS**\n\n"
        
        total_stock = sum(p.stock for p in products)
        in_stock_count = sum(1 for p in products if p.stock > 0)
        out_of_stock_count = len(products) - in_stock_count
        
        response += f"• **Total unités en stock** : {total_stock}\n"
        response += f"• **Produits disponibles** : {in_stock_count} ({in_stock_count/len(products)*100:.0f}%)\n"
        response += f"• **Produits en rupture** : {out_of_stock_count} ({out_of_stock_count/len(products)*100:.0f}%)\n\n"
        
        # Top 5 mieux approvisionnés
        stocked = sorted(products, key=lambda x: x.stock, reverse=True)[:5]
        response += "**✅ TOP 5 MIEUX APPROVISIONNÉS**\n"
        for i, p in enumerate(stocked, 1):
            response += f"{i}. **{p.name}** — {p.stock} unités | {p.price}€\n"
        
        # Produits en rupture
        if out_of_stock_count > 0:
            out_of_stock = [p for p in products if p.stock == 0][:5]
            response += "\n**❌ PRODUITS EN RUPTURE**\n"
            for i, p in enumerate(out_of_stock, 1):
                response += f"{i}. **{p.name}** — {p.price}€ | {p.category}\n"
        
        return response

    def _format_popularity_global_comparison(self, products):
        """Formatte la comparaison globale de popularité"""
        response = "**🔥 ANALYSE DE POPULARITÉ**\n\n"
        
        total_orders = sum(p.order_count for p in products)
        avg_orders = total_orders / len(products)
        
        response += f"• **Total commandes** : {total_orders}\n"
        response += f"• **Moyenne commandes/produit** : {avg_orders:.0f}\n\n"
        
        # Top 5 plus commandés
        popular = sorted(products, key=lambda x: x.order_count, reverse=True)[:5]
        response += "**🏆 TOP 5 PLUS COMMANDÉS**\n"
        for i, p in enumerate(popular, 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
            response += f"{medal} **{p.name}** — {p.order_count} commandes | {p.price}€ | ⭐{p.rating}\n"
        
        # Top 5 mieux notés
        best_rated = sorted(products, key=lambda x: x.rating, reverse=True)[:5]
        response += "\n**⭐ TOP 5 MIEUX NOTÉS**\n"
        for i, p in enumerate(best_rated, 1):
            response += f"{i}. **{p.name}** — ⭐{p.rating}/5 | {p.order_count} commandes\n"
        
        return response

    def _format_features_global_comparison(self, products):
        """Formatte la comparaison globale des caractéristiques"""
        response = "**✅ ANALYSE DES CARACTÉRISTIQUES**\n\n"
        
        # Statistiques sur les features
        all_features = []
        features_per_product = []
        
        for p in products:
            features_per_product.append(len(p.features))
            all_features.extend(p.features)
        
        unique_features = set(all_features)
        
        response += f"• **Total caractéristiques** : {len(all_features)}\n"
        response += f"• **Caractéristiques uniques** : {len(unique_features)}\n"
        response += f"• **Moyenne par produit** : {sum(features_per_product)/len(products):.1f}\n"
        response += f"• **Max caractéristiques** : {max(features_per_product)}\n"
        response += f"• **Min caractéristiques** : {min(features_per_product)}\n\n"
        
        # Produits avec le plus de caractéristiques
        most_features = sorted(products, key=lambda x: len(x.features), reverse=True)[:5]
        response += "**📊 PRODUITS LES PLUS RICHES EN CARACTÉRISTIQUES**\n"
        for i, p in enumerate(most_features, 1):
            response += f"{i}. **{p.name}** — {len(p.features)} caractéristiques | {p.price}€\n"
        
        # Caractéristiques les plus communes
        feature_count = {}
        for f in all_features:
            feature_count[f] = feature_count.get(f, 0) + 1
        
        common_features = sorted(feature_count.items(), key=lambda x: x[1], reverse=True)[:5]
        response += "\n**🔍 CARACTÉRISTIQUES LES PLUS COURANTES**\n"
        for f, count in common_features:
            response += f"• **{f[:50]}** — présent sur {count} produits\n"
        
        return response

    def _format_specs_global_comparison(self, products):
        """Formatte la comparaison globale des spécifications techniques"""
        response = "**🔧 ANALYSE DES SPÉCIFICATIONS TECHNIQUES**\n\n"
        
        # Compter toutes les spécifications
        all_specs = {}
        for p in products:
            for k in p.specifications.keys():
                all_specs[k] = all_specs.get(k, 0) + 1
            for k in p.technicalSpecs.keys():
                key = f"[Tech] {k}"
                all_specs[key] = all_specs.get(key, 0) + 1
        
        response += f"• **Types de spécifications** : {len(all_specs)}\n\n"
        
        # Spécifications les plus communes
        common_specs = sorted(all_specs.items(), key=lambda x: x[1], reverse=True)[:8]
        response += "**📋 SPÉCIFICATIONS LES PLUS FRÉQUENTES**\n"
        for spec, count in common_specs:
            spec_name = spec.replace('[Tech] ', '')
            response += f"• **{spec_name}** — présent sur {count} produits\n"
        
        return response

    def _detailed_comparison(self, products):
        """Comparaison détaillée complète"""
        comparison = self.comparator.compare(products)
        response = self._format_comparison(comparison, None)
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': {k: v for k, v in comparison.items() if k != 'products'},
            'comparison_type': 'detailed'
        }

    def _standard_comparison(self, products):
        """Comparaison standard"""
        comparison = self.comparator.compare(products)
        response = self._format_comparison(comparison, None)
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': {k: v for k, v in comparison.items() if k != 'products'},
            'comparison_type': 'standard'
        }

    def _price_comparison(self, products):
        """Comparaison uniquement sur le prix"""
        comparison = self.comparator.compare(products, 'prix')
        
        # S'assurer que la comparaison existe
        if not comparison:
            return self._standard_comparison(products)
        
        response = "**💰 COMPARAISON DES PRIX**\n\n"
        
        # Extraire uniquement les infos de prix
        price_comp = comparison.get('price_comparison', {})
        if price_comp:
            for name, price in price_comp.get('prices', {}).items():
                response += f"• **{name}** : {price}€\n"
            
            response += f"\n**Moins cher** : **{price_comp.get('cheapest')}** à {price_comp.get('prices', {}).get(price_comp.get('cheapest'), '?')}€\n"
            response += f"**Écart de prix** : {price_comp.get('difference', 0):.0f}€\n"
            response += f"**Prix moyen** : {price_comp.get('average', 0):.0f}€\n"
            
            # Ajout de conseil
            response += "\n💡 **Conseil** : "
            cheapest = price_comp.get('cheapest')
            most_expensive = price_comp.get('most_expensive')
            if cheapest and most_expensive:
                if cheapest == most_expensive:
                    response += "Tous les produits ont le même prix."
                else:
                    response += f"Si vous avez un budget limité, choisissez **{cheapest}**. Pour plus de fonctionnalités, regardez **{most_expensive}**."
        else:
            response += "Aucune information de prix disponible."
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'price'
        }

    def _stock_comparison(self, products):
        """Comparaison sur le stock"""
        comparison = self.comparator.compare(products, 'stock')
        
        if not comparison:
            return self._standard_comparison(products)
        
        response = "**📦 COMPARAISON DES STOCKS**\n\n"
        
        stock_comp = comparison.get('stock_comparison', {})
        if stock_comp:
            for name, stock in stock_comp.items():
                status = "✅ En stock" if stock > 0 else "❌ Rupture"
                response += f"• **{name}** : {status} ({stock} unités)\n"
            
            # Trouver le mieux stocké
            if stock_comp:
                best_stock = max(stock_comp.items(), key=lambda x: x[1])
                response += f"\n**Mieux approvisionné** : **{best_stock[0]}** ({best_stock[1]} unités)\n"
        else:
            response += "Aucune information de stock disponible."
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'stock'
        }

    def _specs_comparison(self, products):
        """Comparaison des spécifications techniques"""
        comparison = self.comparator.compare(products, 'spec')
        
        if not comparison:
            return self._standard_comparison(products)
        
        response = "**🔧 COMPARAISON DES SPÉCIFICATIONS TECHNIQUES**\n\n"
        
        specs = comparison.get('specs_comparison', {})
        if specs:
            # Afficher les 8 premières spécifications les plus importantes
            displayed = 0
            for spec_name, values in specs.items():
                if displayed >= 8:
                    response += f"\n*... et {len(specs) - 8} autres spécifications*\n"
                    break
                    
                # Nettoyer le nom de spec
                clean_name = spec_name.replace('[Tech] ', '')
                response += f"**{clean_name}**\n"
                for prod_name, value in values.items():
                    response += f"  • {prod_name}: {value}\n"
                response += "\n"
                displayed += 1
        else:
            response += "Aucune spécification technique disponible pour ces produits.\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'specs'
        }

    def _features_comparison(self, products):
        """Comparaison des caractéristiques"""
        comparison = self.comparator.compare(products, 'feature')
        
        if not comparison:
            return self._standard_comparison(products)
        
        response = "**✅ COMPARAISON DES CARACTÉRISTIQUES**\n\n"
        
        features = comparison.get('features_comparison', {})
        if features:
            # Compter le nombre de features par produit
            feature_count = {}
            for product in products:
                feature_count[product.name] = 0
            
            # Afficher les features uniques
            displayed = 0
            for feature, presence in features.items():
                if displayed >= 10:
                    break
                
                has_feature = [name for name, present in presence.items() if present]
                if len(has_feature) < len(products):  # Feature non commune
                    response += f"**{feature[:60]}**\n"
                    for name in presence.keys():
                        if presence[name]:
                            response += f"  ✅ {name}\n"
                            feature_count[name] += 1
                    response += "\n"
                    displayed += 1
            
            # Résumé
            if any(feature_count.values()):
                response += "**📊 RÉSUMÉ**\n"
                for name, count in feature_count.items():
                    if count > 0:
                        response += f"• {name}: {count} caractéristiques uniques\n"
        else:
            response += "Aucune caractéristique disponible pour ces produits.\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'features'
        }

    def _popularity_comparison(self, products):
        """Comparaison par popularité/commandes"""
        comparison = self.comparator.compare(products, 'order')
        
        if not comparison:
            return self._standard_comparison(products)
        
        response = "**🔥 COMPARAISON DE POPULARITÉ**\n\n"
        
        orders = comparison.get('orders_comparison', {})
        if orders:
            sorted_orders = sorted(orders.items(), key=lambda x: x[1], reverse=True)
            
            for i, (name, count) in enumerate(sorted_orders, 1):
                medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
                response += f"{medal} **{name}** : {count} commandes\n"
            
            if sorted_orders:
                response += f"\n**Plus populaire** : {sorted_orders[0][0]} avec {sorted_orders[0][1]} commandes\n"
        else:
            response += "Aucune information de popularité disponible."
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'popularity'
        }

    def _keyword_comparison(self, products, keyword):
        """Comparaison selon un mot-clé libre"""
        if not keyword:
            return self._standard_comparison(products)
        
        # Utiliser la méthode existante
        comparison = self.comparator.compare_by_keyword(products, keyword)
        
        if not comparison:
            return self._standard_comparison(products)
        
        if not comparison.get('keyword_features') and not comparison.get('keyword_specs'):
            response = f"**⚠️ Aucun produit ne contient « {keyword} » dans ses spécifications**\n\n"
            response += self._format_comparison(comparison, None)
        else:
            response = self._format_comparison_keyword(comparison, keyword)
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison,
            'comparison_type': 'keyword',
            'keyword': keyword
        }

    def _best_product_comparison(self, products, criteria=None):
        """Trouve et affiche le meilleur produit selon critère"""
        if criteria:
            # Utiliser la comparaison existante
            comparison = self.comparator.compare(products, criteria)
            if comparison:
                best_by_criteria = comparison.get('best_by_criteria')
                if best_by_criteria:
                    response = f"**🏆 MEILLEUR PRODUIT SELON « {criteria.upper()} »**\n\n"
                    best_product = next((p for p in products if p.name == best_by_criteria), None)
                    if best_product:
                        response += f"**{best_product.name}**\n\n"
                        
                        if criteria == 'prix':
                            response += f"💰 Prix : {best_product.price}€\n"
                        elif criteria == 'stock':
                            response += f"📦 Stock : {best_product.stock} unités\n"
                        elif criteria == 'order':
                            response += f"🛒 Commandes : {best_product.order_count}\n"
                        elif criteria == 'spec' or criteria == 'caracteristique':
                            response += f"⭐ Note : {best_product.rating}/5\n"
                            if best_product.features:
                                response += f"✅ {len(best_product.features)} caractéristiques\n"
                        
                        if best_product.features:
                            response += f"\n**Points forts :**\n"
                            for f in best_product.features[:3]:
                                response += f"• {f}\n"
                        
                        return {
                            'response': response,
                            'products': [best_product],
                            'action': 'show_product',
                            'best_product': best_product.name
                        }
        
        # Sinon, utiliser la recommandation générale
        comparison = self.comparator.compare(products)
        if comparison:
            recommendation = comparison.get('recommendation', {})
            best_name = recommendation.get('best_product')
            
            if best_name:
                best_product = next((p for p in products if p.name == best_name), None)
                if best_product:
                    response = f"**🏆 MEILLEUR PRODUIT**\n\n"
                    response += f"**{best_product.name}**\n\n"
                    response += f"{recommendation.get('explanation', '')}\n\n"
                    response += f"💡 **Pourquoi ?** Basé sur une analyse complète : prix, popularité, stock, caractéristiques."
                    
                    return {
                        'response': response,
                        'products': [best_product],
                        'action': 'show_product',
                        'best_product': best_product.name
                    }
        
        return self._standard_comparison(products)

    def _insufficient_products_response(self):
        """Réponse quand pas assez de produits pour comparer"""
        return {
            'response': (
                "**⚠️ Impossible de comparer**\n\n"
                "Pour faire une comparaison, j'ai besoin d'au moins 2 produits.\n\n"
                "**Comment faire ?**\n"
                "• Cherchez une catégorie : *affiche les tours CNC*\n"
                "• Listez tous les produits : *tous les produits*\n"
                "• Comparez tout le catalogue : *comparer tous*\n"
                "• Comparez par critère : *comparer tous selon le prix*\n"
                "• Ou nommez directement : *compare De2-Ultra et PC1 Baby*\n\n"
                "Une fois les produits affichés, vous pourrez les comparer !"
            ),
            'products': [],
            'action': 'chat'
        }

    def _get_recent_products_from_history(self, history):
        """Récupère les produits récents de l'historique"""
        products = []
        seen_ids = set()
        
        for msg in reversed(history[-15:]):  # Derniers 15 messages
            for p in msg.get('products', []):
                if hasattr(p, 'id'):
                    if p.id not in seen_ids:
                        seen_ids.add(p.id)
                        products.append(p)
                elif isinstance(p, dict) and p.get('id'):
                    if p['id'] not in seen_ids:
                        seen_ids.add(p['id'])
                        # Convertir dict en objet Product si nécessaire
                        prod = self.data_loader.get_product_by_id(p['id'])
                        if prod:
                            products.append(prod)
        
        return products

    # ================================================================
    # GESTIONNAIRES DE RÉPONSES STANDARD
    # ================================================================

    def _identity_response(self):
        """Réponse à la question 'qui es-tu'"""
        total = len(self.data_loader.get_all_products())
        cats = len(self.data_loader.get_all_categories())
        return {
            'response': (
                f"🤖 **Assistant Produit**\n\n"
                f"Je suis votre guide pour explorer notre catalogue de **{total} produits** "
                f"répartis dans **{cats} catégories**.\n\n"
                f"**Ce que je peux faire :**\n"
                f"• 🔍 Rechercher des produits\n"
                f"• 📊 Comparer des produits (prix, specs, caractéristiques)\n"
                f"• 📊 Comparer TOUS les produits (tapez *comparer tous*)\n"
                f"• 📊 Analyser par critère (tapez *comparer tous selon le prix*)\n"
                f"• 💡 Recommander le meilleur produit selon vos besoins\n"
                f"• 📋 Lister les catégories et produits\n\n"
                f"Posez-moi des questions en langage naturel !"
            ),
            'products': [],
            'action': 'chat'
        }

    def _handle_category_query(self, message, session):
        msg_lower = message.lower().strip()

        category_patterns = [
            r'produits? (?:de|dans|pour) (?:la|le|les)? ?cat[eé]gorie[s]?[\s:]*([a-zéèêëàâîïôûç\s-]+)',
            r'produits? (?:du|de la|des) rayon[s]?[\s:]*([a-zéèêëàâîïôûç\s-]+)',
            r'(?:affiche|montre|liste)[\s:]*(?:moi)?[\s:]*les? produits? (?:de|dans|pour) (?:la|le|les)? ?cat[eé]gorie[s]?[\s:]*([a-zéèêëàâîïôûç\s-]+)',
            r'que avez-vous dans (?:la|le|les)? ?cat[eé]gorie[s]?[\s:]*([a-zéèêëàâîïôûç\s-]+)',
            r'quels produits (?:dans|pour) (?:la|le|les)? ?cat[eé]gorie[s]?[\s:]*([a-zéèêëàâîïôûç\s-]+)',
            r'tous les produits de ([a-zéèêëàâîïôûç\s-]+)',
        ]

        category_name = None
        for pattern in category_patterns:
            match = re.search(pattern, msg_lower)
            if match:
                category_name = match.group(1).strip()
                break

        if not category_name:
            all_categories = self.data_loader.get_all_categories()
            for cat in all_categories:
                if cat.lower() in msg_lower and len(msg_lower.split()) <= 6:
                    category_name = cat
                    break

        if not category_name:
            return None

        products = self.data_loader.get_products_by_category(category_name)

        if not products:
            all_products = self.data_loader.get_all_products()
            products = [p for p in all_products
                       if category_name.lower() in p.category.lower()
                       or category_name.lower() in p.mainCategory.lower()]

        if products:
            if session:
                session['context']['current_category'] = category_name
                # Stocker les produits dans le contexte pour la comparaison ultérieure
                session['context']['last_products'] = products

            response = f"**📁 {category_name.upper()}** — {len(products)} produit(s)\n\n"
            response += "💡 **Astuce** : Dites *compare ces produits* ou *meilleur produit* pour analyser cette liste."

            return {
                'response': response,
                'products': products[:15],
                'action': 'show_products',
                'category': category_name
            }

        return None

    def _greeting_response(self, history):
        if len(history) <= 1:
            cats = self.data_loader.get_all_categories()
            main_cats = [c for c in cats if len(self.data_loader.get_products_by_category(c)) >= 3][:5]
            response = (
                "Bonjour ! 👋 Je suis votre assistant produit.\n\n"
                "Je peux vous aider à :\n"
                "• 🔍 **Rechercher** un produit\n"
                "• 📊 **Comparer** des produits (2-3 produits)\n"
                "• 📊 **Comparer TOUS** les produits (tapez *comparer tous*)\n"
                "• 📊 **Analyser par critère** (tapez *comparer tous selon le prix*)\n"
                "• 💡 **Recommander** le meilleur selon vos besoins\n"
                "• 💰 **Filtrer** par prix, stock, popularité\n"
                "• 📋 **Parcourir** les catégories\n\n"
                f"Nous avons **{len(self.data_loader.get_all_products())} produits** dans **{len(main_cats)}+ catégories**.\n\n"
                "Que cherchez-vous ?"
            )
        else:
            response = "Re-bonjour ! Comment puis-je vous aider aujourd'hui ?"
        return {'response': response, 'products': [], 'action': 'chat'}

    def _help_message(self):
        total = len(self.data_loader.get_all_products())
        return (
            f"**🤖 ASSISTANT PRODUIT** — {total} produits disponibles\n\n"
            "**RECHERCHE LIBRE**\n"
            "• *tour CNC*\n"
            "• *oscilloscope pour labo*\n"
            "• *capteur voiture*\n\n"
            "**COMPARAISON**\n"
            "• *compare De2-Ultra et PC1 Baby*\n"
            "• *De2 vs PC1 — lequel est moins cher ?*\n"
            "• *comparer selon le stock*\n"
            "• *comparer selon la vitesse*\n"
            "• *comparer tous* (vue d'ensemble du catalogue)\n"
            "• *comparer tous selon le prix* (analyse globale des prix)\n"
            "• *comparer tous selon les spécifications*\n"
            "• *comparer tous selon la popularité*\n"
            "• *comparer tous selon les caractéristiques*\n"
            "• *meilleur produit parmi ceux-ci*\n\n"
            "**FILTRES**\n"
            "• *produits moins de 5000€*\n"
            "• *produits en stock*\n"
            "• *les plus vendus*\n\n"
            "**EXPLORER**\n"
            "• *liste des catégories*\n"
            "• *tous les produits CNC*\n\n"
            "Posez votre question en langage naturel !"
        )

    def _list_categories(self):
        """Retourne les catégories AVEC structure JSON pour les boutons frontend."""
        cats = self.data_loader.get_all_categories()
        cat_data = []
        for cat in sorted(cats):
            count = len(self.data_loader.get_products_by_category(cat))
            if count > 0:
                cat_data.append({'name': cat.title(), 'raw_name': cat, 'count': count, 'level': 1})

        cat_data.sort(key=lambda x: x['count'], reverse=True)

        response = f"**📋 CATÉGORIES DISPONIBLES** ({len(cat_data)} catégories)\n\nCliquez sur une catégorie pour voir ses produits 👇"

        return {
            'response': response,
            'products': [],
            'action': 'list_categories',
            'categories': cat_data
        }

    def _list_all_products(self):
        products = self.data_loader.get_all_products()
        total = len(products)
        
        response = f'**📋 CATALOGUE COMPLET** — {total} produits'
        
        if total > 15:
            response += f"\n\n💡 *J'affiche les 15 premiers produits. Pour voir plus, précisez votre recherche ou filtrez par catégorie.*"
            displayed_products = products[:15]
        else:
            displayed_products = products[:20]
        
        response += "\n\n📊 **Pour comparer** :\n"
        response += "• *compare ces produits* (comparer les 3 premiers)\n"
        response += "• *comparer tous* (vue d'ensemble du catalogue)\n"
        response += "• *comparer tous selon le prix* (analyse des prix)"
        
        return {
            'response': response,
            'products': displayed_products,
            'action': 'show_products'
        }

    def _handle_recommendation(self, message, msg_lower, context):
        price_constraint = self._extract_price_constraint(msg_lower)
        all_products = self.data_loader.get_all_products()
        if price_constraint:
            if 'max' in price_constraint:
                all_products = [p for p in all_products if p.price <= price_constraint['max']]
            if 'min' in price_constraint:
                all_products = [p for p in all_products if p.price >= price_constraint['min']]

        search_results = self.search_engine.search(message, limit=10)
        candidate_pool = search_results if search_results else all_products

        if not candidate_pool:
            return {
                'response': f"Aucun produit trouvé avec ce budget.",
                'products': [], 'action': 'chat'
            }

        best = self._score_and_recommend(candidate_pool)

        response = "**💡 RECOMMANDATION PERSONNALISÉE**\n\n"
        if price_constraint:
            response += f"💰 **Budget** : jusqu'à {price_constraint.get('max', '?')}€\n\n"

        response += f"🏆 **Meilleur choix : {best[0].name}**\n"
        response += f"   💰 Prix : {best[0].price}€\n"
        response += f"   📦 Stock : {best[0].stock} unités\n"
        response += f"   ⭐ Note : {best[0].rating}/5\n"
        response += f"   🛒 Commandes : {best[0].order_count}\n"
        if best[0].features:
            response += f"   ✅ {best[0].features[0]}\n"
        response += "\n"

        if len(best) > 1:
            response += "**Autres bonnes options :**\n"
            for p in best[1:4]:
                response += f"• **{p.name}** — {p.price}€ | ⭐{p.rating} | 📦{p.stock}\n"

        response += "\n💬 Dites *compare* pour analyser ces produits en détail."
        return {'response': response, 'products': best[:5], 'action': 'show_products'}

    def _handle_price_query(self, message, msg_lower):
        constraint = self._extract_price_constraint(msg_lower)
        all_products = self.data_loader.get_all_products()

        if constraint:
            filtered = all_products
            if 'max' in constraint:
                filtered = [p for p in filtered if p.price <= constraint['max']]
            if 'min' in constraint:
                filtered = [p for p in filtered if p.price >= constraint['min']]

            if not filtered:
                return {
                    'response': f"Aucun produit dans cette tranche de prix. "
                               f"Les prix vont de {min(p.price for p in all_products):.0f}€ "
                               f"à {max(p.price for p in all_products):.0f}€.",
                    'products': [], 'action': 'chat'
                }

            filtered_sorted = sorted(filtered, key=lambda x: x.price)
            label = f"moins de {constraint['max']}€" if 'max' in constraint else "dans votre budget"
            response = f"**💰 PRODUITS {label.upper()}** — {len(filtered_sorted)} trouvés\n\n"
            for p in filtered_sorted[:10]:
                stock = "✅" if p.stock > 0 else "❌"
                response += f"{stock} **{p.name}** — **{p.price}€** | {p.category}\n"
            return {'response': response, 'products': filtered_sorted[:10], 'action': 'show_products'}

        if any(w in msg_lower for w in ['moins cher', 'pas cher', 'abordable', 'budget', 'economique']):
            products = sorted(all_products, key=lambda x: x.price)[:8]
            response = "**💰 PRODUITS LES MOINS CHERS**\n\n"
        elif any(w in msg_lower for w in ['plus cher', 'haut de gamme', 'premium', 'luxe']):
            products = sorted(all_products, key=lambda x: x.price, reverse=True)[:8]
            response = "**💎 PRODUITS HAUT DE GAMME**\n\n"
        else:
            products = sorted(all_products, key=lambda x: x.price)[:8]
            response = "**📊 APERÇU DES PRIX**\n\n"

        for p in products:
            stock = "✅" if p.stock > 0 else "❌"
            response += f"{stock} **{p.name}** — **{p.price}€** | {p.category}\n"

        avg = sum(p.price for p in all_products) / len(all_products)
        response += f"\n📊 Prix moyen catalogue : {avg:.0f}€"
        return {'response': response, 'products': products, 'action': 'show_products'}

    def _handle_stock_query(self, msg_lower):
        all_products = self.data_loader.get_all_products()

        if any(w in msg_lower for w in ['rupture', 'épuisé', 'out of stock', 'pas disponible']):
            products = [p for p in all_products if p.stock == 0]
            label = "EN RUPTURE DE STOCK"
        else:
            products = [p for p in all_products if p.stock > 0]
            products = sorted(products, key=lambda x: x.stock, reverse=True)
            label = "DISPONIBLES EN STOCK"

        response = f"**📦 PRODUITS {label}** — {len(products)} produits\n\n"
        for p in products[:10]:
            response += f"✅ **{p.name}** — {p.stock} unités | {p.price}€\n"
        return {'response': response, 'products': products[:10], 'action': 'show_products'}

    def _handle_order_query(self, msg_lower):
        products = sorted(self.data_loader.get_all_products(), key=lambda x: x.order_count, reverse=True)
        response = f"**🔥 PRODUITS LES PLUS COMMANDÉS**\n\n"
        for i, p in enumerate(products[:10], 1):
            response += f"**#{i}** {p.name} — {p.order_count} commandes | {p.price}€\n"
        return {'response': response, 'products': products[:10], 'action': 'show_products'}

    def _handle_feature_spec_query(self, message, msg_lower):
        products = self.search_engine.search(message, limit=10)
        if not products:
            products = self._search_in_features_specs(msg_lower)

        if products:
            response = f"**🔧 PRODUITS CORRESPONDANTS** — {len(products)} résultats\n\n"
            for p in products:
                matching = self._find_matching_feature(p, msg_lower)
                response += f"• **{p.name}** ({p.price}€)"
                if matching:
                    response += f" — *{matching}*"
                response += "\n"
        else:
            response = "Aucun produit trouvé avec cette caractéristique. Essayez d'autres mots-clés."

        return {'response': response, 'products': products, 'action': 'show_products'}

    def _handle_free_search(self, message, msg_lower, context, history):
        products = self.search_engine.search(message, limit=8)

        if not products:
            keywords = self.text_processor.extract_keywords(message)
            for kw in keywords:
                if len(kw) > 3:
                    products = self.search_engine.search(kw, limit=5)
                    if products:
                        break

        if products:
            # Stocker dans le contexte pour les futures comparaisons
            # Mais limiter à 5 produits max dans le contexte
            context['last_products'] = products[:5]
            
            if len(products) == 1:
                p = products[0]
                response = f"**{p.name}**\n\n"
                response += f"💰 Prix : **{p.price}€**\n"
                response += f"📦 Stock : {p.stock} unités\n"
                response += f"🏷️ Catégorie : {p.category}\n"
                response += f"⭐ Note : {p.rating}/5\n"
                response += f"🛒 Commandes : {p.order_count}\n"
                if p.description:
                    response += f"\n📝 {p.description[:200]}...\n"
                if p.features:
                    response += "\n**Caractéristiques :**\n"
                    for f in p.features[:5]:
                        response += f"• {f}\n"
                if p.specifications:
                    response += "\n**Spécifications :**\n"
                    for k, v in list(p.specifications.items())[:5]:
                        response += f"• {k}: {v}\n"
                response += "\n💬 Tapez *compare* pour le comparer avec un autre produit."
            else:
                response = f"**🔍 RÉSULTATS** — {len(products)} produits trouvés pour « {message} »\n\n"
                for i, p in enumerate(products, 1):
                    stock = "✅" if p.stock > 0 else "❌"
                    response += f"{stock} **{i}. {p.name}** — {p.price}€ | {p.category}\n"
                
                if len(products) > 3:
                    response += f"\n💡 **Astuce** : Dites *compare ces produits* pour comparer les 3 premiers."
                else:
                    response += f"\n💡 **Astuce** : Dites *compare ces produits* pour les comparer."
                response += f"\nOu *comparer tous* pour une vue d'ensemble du catalogue."
            
            return {'response': response, 'products': products, 'action': 'show_products'}

        cats = self.data_loader.get_all_categories()
        response = (
            f"Je n'ai pas trouvé de produit pour « {message} ».\n\n"
            "**Suggestions :**\n"
            "• Essayez un mot-clé différent\n"
            "• Tapez *liste des catégories* pour explorer\n"
            "• Tapez *conseil* pour une recommandation\n"
            "• Tapez *comparer tous* pour voir tout le catalogue\n"
            f"• Nous avons {len(self.data_loader.get_all_products())} produits dans {len(cats)} catégories"
        )
        return {'response': response, 'products': [], 'action': 'chat'}

    # ================================================================
    # UTILITAIRES
    # ================================================================

    def _score_and_recommend(self, products):
        if not products:
            return []

        max_price = max(p.price for p in products) or 1
        max_stock = max(p.stock for p in products) or 1
        max_features = max(len(p.features) for p in products) or 1
        max_orders = max(p.order_count for p in products) or 1

        scored = []
        for p in products:
            score = 0
            score += (1 - p.price / max_price) * 25
            score += (p.stock / max_stock) * 20
            score += (len(p.features) / max_features) * 20
            score += p.rating * 5
            score += (p.order_count / max_orders) * 10
            scored.append((score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored]

    def _search_in_features_specs(self, query):
        results = []
        query_lower = query.lower()
        words = [w for w in query_lower.split() if len(w) > 3]

        for product in self.data_loader.get_all_products():
            score = 0
            for feature in product.features:
                if any(w in feature.lower() for w in words):
                    score += 2
            for k, v in product.specifications.items():
                if any(w in k.lower() or w in str(v).lower() for w in words):
                    score += 1
            for k, v in product.technicalSpecs.items():
                if any(w in k.lower() or w in str(v).lower() for w in words):
                    score += 1
            if score > 0:
                results.append((score, product))

        results.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in results[:10]]

    def _find_matching_feature(self, product, query):
        words = [w for w in query.split() if len(w) > 3]
        for feature in product.features:
            if any(w in feature.lower() for w in words):
                return feature[:60]
        for k, v in product.specifications.items():
            if any(w in k.lower() or w in str(v).lower() for w in words):
                return f"{k}: {v}"
        return None

    def _format_comparison(self, comparison, criteria=None):
        """Formate la comparaison de manière naturelle et lisible"""
        if not comparison:
            return "Impossible d'effectuer la comparaison."
        
        products = comparison.get('products', [])
        
        # Introduction naturelle
        if len(products) == 2:
            response = f"**📊 Comparaison entre {products[0]['name']} et {products[1]['name']}**\n\n"
        else:
            names = [p.get('name', '?') for p in products]
            if len(names) > 2:
                response = f"**📊 Comparaison entre {', '.join(names[:-1])} et {names[-1]}**\n\n"
            else:
                response = f"**📊 Comparaison**\n\n"
        
        response += "─" * 40 + "\n\n"
        
        # Résumé rapide
        response += "**En résumé :**\n"
        for item in comparison.get('summary', []):
            stock_icon = "✅" if item.get('stock', 0) > 0 else "❌"
            response += f"• **{item['name']}** : {item['price']}€, ⭐{item['rating']}, {stock_icon} {item['stock']} en stock\n"
        response += "\n"
        
        # Points clés selon le critère
        if criteria == 'prix':
            pc = comparison.get('price_comparison', {})
            response += f"💰 **Prix** : Le moins cher est **{pc.get('cheapest')}** à {pc.get('prices', {}).get(pc.get('cheapest'), '?')}€\n"
            response += f"   (différence de {pc.get('difference', 0):.0f}€)\n\n"
        
        elif criteria == 'stock':
            sc = comparison.get('stock_comparison', {})
            best_stock = max(sc.items(), key=lambda x: x[1])
            response += f"📦 **Stock** : **{best_stock[0]}** est le mieux approvisionné ({best_stock[1]} unités)\n\n"
        
        elif criteria == 'order':
            oc = comparison.get('orders_comparison', {})
            best_seller = max(oc.items(), key=lambda x: x[1])
            response += f"🔥 **Popularité** : **{best_seller[0]}** est le plus commandé ({best_seller[1]} commandes)\n\n"
        
        # Si pas de critère spécifique, afficher plus de détails
        if not criteria:
            # Prix
            pc = comparison.get('price_comparison', {})
            response += "**💰 Prix :**\n"
            for name, price in pc.get('prices', {}).items():
                marker = " ✓ (moins cher)" if name == pc.get('cheapest') else ""
                response += f"  • {name}: {price}€{marker}\n"
            response += "\n"
            
            # Stock
            sc = comparison.get('stock_comparison', {})
            response += "**📦 Stock :**\n"
            for name, stock in sc.items():
                status = "✅" if stock > 0 else "❌"
                response += f"  • {name}: {status} ({stock} unités)\n"
            response += "\n"
            
            # Points forts de chaque produit (features exclusives)
            fc = comparison.get('features_comparison', {})
            if fc:
                response += "**✨ Points forts :**\n"
                for product in products:
                    name = product.get('name')
                    product_features = [f for f, data in fc.items() if data.get(name, False)]
                    # Ne garder que les features que ce produit a et pas les autres
                    exclusive_features = []
                    for f in product_features:
                        has_count = sum(1 for p in products if fc[f].get(p.get('name'), False))
                        if has_count == 1:  # Feature exclusive
                            exclusive_features.append(f)
                    
                    if exclusive_features:
                        response += f"  • **{name}** : {', '.join(exclusive_features[:2])}\n"
                response += "\n"
        
        # Recommandation finale
        if comparison.get('recommendation'):
            rec = comparison['recommendation']
            response += "─" * 40 + "\n"
            response += f"🏆 **Mon conseil** : {rec['best_product']}\n"
            response += f"💡 {rec['explanation']}\n"
            response += "\n"
        
        # Invitation à approfondir
        response += "💬 **Pour approfondir** :\n"
        response += "  • *compare selon le prix*\n"
        response += "  • *compare les spécifications*\n"
        response += "  • *quel est le meilleur pour moi*\n"
        
        return response

    def _format_comparison_keyword(self, comparison, keyword):
        """Formate une comparaison selon un mot-clé libre (feature/spec spécifique)"""
        if not comparison:
            return "Impossible d'effectuer la comparaison."
        
        products = comparison.get('products', [])
        names = [p.get('name', '?') for p in products]
        
        response = f"**📊 COMPARAISON SELON « {keyword.upper()} »**\n\n"
        response += f"Produits : {' vs '.join(names)}\n\n"
        
        found_anything = False
        
        # Features contenant le mot-clé
        kf = comparison.get('keyword_features', {})
        if kf and any(v for v in kf.values()):
            found_anything = True
            response += f"**✅ Caractéristiques avec « {keyword} »**\n"
            for name, feats in kf.items():
                if feats:
                    response += f"• **{name}** :\n"
                    for f in feats[:3]:
                        response += f"  — {f}\n"
                else:
                    response += f"• **{name}** : *(aucune)*\n"
            response += "\n"
        
        # Specs contenant le mot-clé
        ks = comparison.get('keyword_specs', {})
        kt = comparison.get('keyword_tech_specs', {})
        combined = {}
        for name in names:
            combined[name] = {}
            combined[name].update(ks.get(name, {}))
            combined[name].update(kt.get(name, {}))
        
        if any(v for v in combined.values()):
            found_anything = True
            response += f"**🔧 Spécifications avec « {keyword} »**\n"
            for name, specs in combined.items():
                if specs:
                    response += f"• **{name}** :\n"
                    for k, v in list(specs.items())[:4]:
                        response += f"  — {k}: {v}\n"
                else:
                    response += f"• **{name}** : *(aucune)*\n"
            response += "\n"
        
        if not found_anything:
            response += f"⚠️ Aucun produit ne contient « {keyword} » dans ses caractéristiques ou spécifications.\n\n"
        
        # Prix toujours affiché
        if comparison.get('price_comparison'):
            pc = comparison['price_comparison']
            response += "**💰 Prix**\n"
            for name, price in pc['prices'].items():
                marker = " 🏷️ (moins cher)" if name == pc['cheapest'] else ""
                response += f"• {name}: **{price}€**{marker}\n"
            response += "\n"
        
        # Recommandation
        if comparison.get('recommendation'):
            rec = comparison['recommendation']
            response += "─" * 40 + "\n"
            response += f"🏆 **Gagnant** : {rec['best_product']}\n"
            response += f"💡 {rec['explanation']}\n"
        
        return response