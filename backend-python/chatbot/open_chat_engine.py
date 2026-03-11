# chatbot/open_chat_engine.py
"""
Moteur de conversation OUVERTE.
Aucune restriction par patterns fixes.
Comprend le langage naturel via extraction de mots-clés et contexte.
VERSION 2 : catégories retournées sous forme structurée + comparaison context-aware
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

        # --- 1. Salutations ---
        if self._has_signal(msg_lower, self.GREETING_SIGNALS) and len(msg_lower.split()) <= 5:
            return self._greeting_response(history)

        # --- 2. Remerciements / Au revoir ---
        if any(w in msg_lower for w in ['merci', 'thanks', 'thank you']):
            return {'response': "De rien ! N'hésitez pas si vous avez d'autres questions. 😊", 'products': [], 'action': 'chat'}
        if any(w in msg_lower for w in ['au revoir', 'bye', 'à bientôt', 'adieu']):
            return {'response': "Au revoir ! À bientôt ! 👋", 'products': [], 'action': 'chat'}

        # --- 3. Aide ---
        if any(w in msg_lower for w in ['aide', 'help', 'comment utiliser', 'que peux-tu', 'que sais tu faire']):
            return {'response': self._help_message(), 'products': [], 'action': 'chat'}

        # --- 4. Liste des catégories ---
        if self._is_category_list_request(msg_lower):
            return self._list_categories()

        # --- 5. Requête spécifique de catégorie ---
        category_result = self._handle_category_query(message, session)
        if category_result:
            return category_result

        # --- 6. Liste de tous les produits ---
        if self._is_product_list_request(msg_lower) and not self._has_specific_product_context(msg_lower):
            return self._list_all_products()

        # --- 7. Comparaison (avec conscience du contexte session) ---
        if self._has_signal(msg_lower, self.COMPARISON_SIGNALS):
            return self._handle_comparison(message, msg_lower, context, history)

        # --- 8. Recommandation ---
        if self._has_signal(msg_lower, self.RECOMMENDATION_SIGNALS):
            return self._handle_recommendation(message, msg_lower, context)

        # --- 9. Recherche par prix ---
        if self._has_signal(msg_lower, self.PRICE_SIGNALS):
            return self._handle_price_query(message, msg_lower)

        # --- 10. Recherche par stock ---
        if self._has_signal(msg_lower, self.STOCK_SIGNALS):
            return self._handle_stock_query(msg_lower)

        # --- 11. Recherche par popularité ---
        if self._has_signal(msg_lower, self.ORDER_SIGNALS):
            return self._handle_order_query(msg_lower)

        # --- 12. Recherche par spec/feature ---
        if self._has_signal(msg_lower, self.SPEC_SIGNALS):
            return self._handle_feature_spec_query(message, msg_lower)

        # --- 13. Recherche générale ---
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

    def _extract_comparison_products(self, message, msg_lower, history):
        """Extrait intelligemment les produits depuis le message ET l'historique session"""
        candidates = []

        # 1. Recherche directe dans le message
        search_results = self.search_engine.search(message, limit=6)
        if search_results:
            candidates.extend(search_results)

        # 2. Noms de produits partiels dans le message
        if len(candidates) < 2:
            all_products = self.data_loader.get_all_products()
            for p in all_products:
                name_lower = p.name.lower()
                name_parts = name_lower.split()
                if any(part in msg_lower and len(part) > 2 for part in name_parts):
                    if p not in candidates:
                        candidates.append(p)

        # 3. Chercher dans l'historique récent (produits déjà affichés dans la conversation)
        if len(candidates) < 2 and history:
            recent_products = []
            for msg in reversed(history[-15:]):
                for p in msg.get('products', []):
                    if hasattr(p, 'id') and p not in recent_products:
                        recent_products.append(p)
                    elif isinstance(p, dict):
                        prod = self.data_loader.get_product_by_id(p.get('id'))
                        if prod and prod not in recent_products:
                            recent_products.append(prod)
            candidates.extend(recent_products)

        # Dédupliquer
        seen = set()
        unique = []
        for p in candidates:
            if p.id not in seen:
                seen.add(p.id)
                unique.append(p)

        return unique[:3]

    def _extract_comparison_criteria(self, msg_lower):
        """
        Extrait le critère de comparaison + mot-clé libre (feature/spec spécifique).
        Retourne (criteria_type, keyword)
        criteria_type: 'prix' | 'stock' | 'order' | 'spec' | 'feature_keyword' | None
        keyword: le mot-clé spécifique si feature/spec libre, sinon None
        """
        if self._has_signal(msg_lower, ['prix', 'tarif', 'coût', 'cher', 'abordable', 'budget']):
            return 'prix', None
        if self._has_signal(msg_lower, ['stock', 'disponible', 'dispo']):
            return 'stock', None
        if self._has_signal(msg_lower, ['order', 'commande', 'vendu', 'acheté', 'populaire']):
            return 'order', None

        # Chercher "selon [mot]" ou "par [mot]" ou "sur [mot]" → critère libre
        m = re.search(r'(?:selon|par|sur|en termes de|en fonction de)\s+(?:le|la|les|leur|leurs)?\s*(\w+)', msg_lower)
        if m:
            keyword = m.group(1)
            # Ignorer les mots de liaison
            if keyword not in {'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du'}:
                return 'feature_keyword', keyword

        if self._has_signal(msg_lower, ['spec', 'spécification', 'technique', 'caractéristique', 'feature']):
            return 'spec', None

        return None, None

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
    # GESTIONNAIRES DE RÉPONSES
    # ================================================================

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
            response += "💡 Cliquez sur **Comparer** ou demandez de comparer ces produits."

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
                "• 📊 **Comparer** des produits\n"
                "• 💡 **Recommander** le meilleur selon vos besoins\n"
                "• 💰 **Filtrer** par prix, stock, popularité\n"
                "• 📋 **Parcourir** les catégories\n\n"
                f"Nous avons **{len(self.data_loader.get_all_products())} produits** dans **{len(main_cats)}+ catégories**.\n\n"
                "Que cherchez-vous ?"
            )
        else:
            response = "Re-bonjour ! Comment puis-je vous aider ?"
        return {'response': response, 'products': [], 'action': 'chat'}

    def _help_message(self):
        total = len(self.data_loader.get_all_products())
        return (
            f"**🤖 ASSISTANT PRODUIT** — {total} produits disponibles\n\n"
            "**RECHERCHE LIBRE**\n"
            "• *tour CNC* • *oscilloscope pour labo* • *capteur voiture*\n\n"
            "**COMPARAISON**\n"
            "• *compare De2-Ultra et PC1 Baby*\n"
            "• *De2 vs PC1 — lequel est moins cher ?*\n"
            "• *comparer selon le stock*\n"
            "• *comparer selon les spécifications*\n"
            "• *comparer selon la vitesse* (mot-clé libre)\n\n"
            "**FILTRES**\n"
            "• *produits moins de 5000€*\n"
            "• *produits en stock*\n"
            "• *les plus vendus*\n\n"
            "**EXPLORER**\n"
            "• *liste des catégories*\n"
            "• *tous les produits CNC*\n\n"
            "Posez votre question en français, arabe ou anglais !"
        )

    def _list_categories(self):
        """
        Retourne les catégories AVEC structure JSON pour les boutons frontend.
        """
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
            'categories': cat_data   # ← clé structurée pour le frontend
        }

    def _list_all_products(self):
        products = self.data_loader.get_all_products()
        return {
            'response': f'**{len(products)} produits** dans le catalogue.',
            'products': products,
            'action': 'show_products'
        }

    def _handle_comparison(self, message, msg_lower, context, history):
        """
        Gère toutes les comparaisons :
        - "comparer ces deux produits" → utilise les produits de l'historique
        - "comparer selon prix/stock/order" → critère standard
        - "comparer selon [mot]" → filtre features/specs contenant ce mot
        """
        products = self._extract_comparison_products(message, msg_lower, history)
        criteria_type, keyword = self._extract_comparison_criteria(msg_lower)

        if len(products) < 2:
            response = (
                "Pour comparer, mentionnez les produits ou consultez une catégorie d'abord.\n"
                "Exemples :\n"
                "• *compare De2-Ultra et PC1 Baby*\n"
                "• *De2 vs PC1 selon le prix*\n"
                "• *comparer selon la vitesse*\n\n"
                "Ou cherchez des produits et demandez ensuite de les comparer !"
            )
            return {'response': response, 'products': [], 'action': 'chat'}

        # Comparaison selon mot-clé libre dans features/specs
        if criteria_type == 'feature_keyword' and keyword:
            comparison = self.comparator.compare_by_keyword(products, keyword)
            response = self._format_comparison_keyword(comparison, keyword)
            return {
                'response': response,
                'products': products,
                'action': 'show_comparison',
                'comparison': {k: v for k, v in comparison.items() if k != 'products'},
                'comparison_criteria': criteria_type,
                'comparison_keyword': keyword
            }

        # Comparaison selon critère standard ou complète
        comparison = self.comparator.compare(products, criteria_type)
        response = self._format_comparison(comparison, criteria_type)

        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': {k: v for k, v in comparison.items() if k != 'products'},
            'comparison_criteria': criteria_type
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
            response += f"Budget : jusqu'à {price_constraint.get('max', '?')}€\n\n"

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

        response += "\n💬 Dites *compare [produit1] et [produit2]* pour une comparaison détaillée."
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
                for p in products:
                    stock = "✅" if p.stock > 0 else "❌"
                    response += f"{stock} **{p.name}** — {p.price}€ | {p.category}\n"
                response += "\n💡 Tapez *compare [produit1] et [produit2]* pour comparer."
            return {'response': response, 'products': products, 'action': 'show_products'}

        cats = self.data_loader.get_all_categories()
        response = (
            f"Je n'ai pas trouvé de produit pour « {message} ».\n\n"
            "**Suggestions :**\n"
            "• Essayez un mot-clé différent\n"
            "• Tapez *liste des catégories* pour explorer\n"
            "• Tapez *conseil* pour une recommandation\n"
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
        """Formate la comparaison complète ou par critère standard"""
        if not comparison:
            return "Impossible d'effectuer la comparaison."

        products = comparison.get('products', [])
        response = "**📊 COMPARAISON DÉTAILLÉE**\n"
        response += "=" * 35 + "\n\n"

        names = [p.get('name', '?') for p in products]
        response += f"**Produits :** {' vs '.join(names)}\n\n"

        # Résumé
        if comparison.get('summary'):
            response += "**📋 RÉSUMÉ**\n"
            for item in comparison['summary']:
                response += (f"• **{item['name']}** : {item['price']}€ | "
                             f"⭐{item['rating']} | 📦{item['stock']} | 🛒{item['orders']}\n")
            response += "\n"

        # Prix
        if criteria in ('prix', None) and comparison.get('price_comparison'):
            pc = comparison['price_comparison']
            response += "**💰 PRIX**\n"
            for name, price in pc['prices'].items():
                marker = " 🏷️ *moins cher*" if name == pc['cheapest'] else ""
                response += f"• {name}: **{price}€**{marker}\n"
            response += f"*Différence: {pc['difference']:.0f}€ | Moyenne: {pc['average']:.0f}€*\n\n"

        # Stock
        if criteria in ('stock', None) and comparison.get('stock_comparison'):
            response += "**📦 STOCK**\n"
            for name, stock in comparison['stock_comparison'].items():
                status = f"✅ {stock} en stock" if stock > 0 else "❌ Rupture"
                response += f"• {name}: {status}\n"
            response += "\n"

        # Commandes/popularité
        if criteria in ('order', None) and comparison.get('orders_comparison'):
            response += "**🛒 COMMANDES (popularité)**\n"
            orders = comparison['orders_comparison']
            best_seller = max(orders.items(), key=lambda x: x[1])
            for name, count in orders.items():
                marker = " 🔥 *plus populaire*" if name == best_seller[0] else ""
                response += f"• {name}: {count} commandes{marker}\n"
            response += "\n"

        # Caractéristiques
        if criteria in ('spec', None) and comparison.get('features_comparison'):
            fc = comparison['features_comparison']
            if fc:
                response += "**✅ CARACTÉRISTIQUES**\n"
                exclusive = {feat: data for feat, data in fc.items() if not all(data.values())}
                for feat, data in list(exclusive.items())[:5]:
                    has = [n for n, v in data.items() if v]
                    hasnot = [n for n, v in data.items() if not v]
                    response += f"• *{feat[:50]}*\n"
                    response += f"  ✅ {', '.join(has)} | ❌ {', '.join(hasnot)}\n"
                response += "\n"

        # Spécifications techniques
        if criteria in ('spec', None) and comparison.get('specs_comparison'):
            sc = comparison['specs_comparison']
            if sc:
                response += "**🔧 SPÉCIFICATIONS TECHNIQUES**\n"
                for spec, data in list(sc.items())[:6]:
                    response += f"• **{spec}**:\n"
                    for name, val in data.items():
                        response += f"  — {name}: {val}\n"
                response += "\n"

        # Recommandation finale
        if comparison.get('recommendation'):
            rec = comparison['recommendation']
            response += "─" * 35 + "\n"
            response += f"🏆 **GAGNANT : {rec['best_product']}**\n"
            response += f"💡 {rec['explanation']}\n"

        return response

    def _format_comparison_keyword(self, comparison, keyword):
        """Formate une comparaison selon un mot-clé libre (feature/spec spécifique)"""
        if not comparison:
            return "Impossible d'effectuer la comparaison."

        products = comparison.get('products', [])
        names = [p.get('name', '?') for p in products]
        response = f"**📊 COMPARAISON — critère : « {keyword} »**\n"
        response += "=" * 35 + "\n\n"
        response += f"**Produits :** {' vs '.join(names)}\n\n"

        # Features contenant le mot-clé
        kf = comparison.get('keyword_features', {})
        if kf and any(v for v in kf.values()):
            response += f"**✅ CARACTÉRISTIQUES contenant « {keyword} »**\n"
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
            response += f"**🔧 SPÉCIFICATIONS contenant « {keyword} »**\n"
            for name, specs in combined.items():
                if specs:
                    response += f"• **{name}** :\n"
                    for k, v in list(specs.items())[:4]:
                        response += f"  — {k}: {v}\n"
                else:
                    response += f"• **{name}** : *(aucune spec)*\n"
            response += "\n"

        # Prix et recommandation toujours affichés
        if comparison.get('price_comparison'):
            pc = comparison['price_comparison']
            response += "**💰 PRIX**\n"
            for name, price in pc['prices'].items():
                marker = " 🏷️ *moins cher*" if name == pc['cheapest'] else ""
                response += f"• {name}: **{price}€**{marker}\n"
            response += "\n"

        if comparison.get('recommendation'):
            rec = comparison['recommendation']
            response += "─" * 35 + "\n"
            response += f"🏆 **GAGNANT : {rec['best_product']}**\n"
            response += f"💡 {rec['explanation']}\n"

        return response