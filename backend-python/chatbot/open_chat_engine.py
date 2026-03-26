# chatbot/open_chat_engine.py
"""
Moteur de conversation OUVERTE - VERSION ULTIME
Aucune restriction, traitement intelligent de TOUTES les requêtes.
Extraction automatique des intentions et mots-clés.
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

        # Catégories connues
        self.categories = self.data_loader.get_all_categories()
        self.category_names_lower = [cat.lower() for cat in self.categories]

        # Mots-clés par catégorie pour la détection
        self.category_keywords = {
            'voiture': ['voiture', 'auto', 'automobile', 'car', 'véhicule', 'diagnostic auto'],
            'cnc': ['cnc', 'tour', 'fraise', 'fraisage', 'tournage', 'milling', 'turning', 'usinage'],
            'mcp': ['mcp', 'labo', 'laboratoire', 'oscilloscope', 'sonde', 'mesure', 'instrument'],
            'capteur': ['capteur', 'actionneur', 'sensor', 'actuator', 'position', 'angle'],
            'education': ['éducation', 'formation', 'école', 'étudiant', 'apprentissage', 'teaching'],
            'accessoire': ['accessoire', 'accessories', 'kit', 'outil', 'tool'],
            'electricite': ['électricité', 'electrique', 'courant', 'tension', 'volt', 'ampere'],
            'reseau': ['réseau', 'can bus', 'bus', 'communication', 'multiplexé']
        }

        # Signaux de comparaison
        self.COMPARISON_SIGNALS = [
            'compar', 'vs', 'versus', 'différence', 'diff', 'lequel', 'laquelle',
            'mieux', 'meilleur entre', 'entre', 'ou bien', 'ou le', 'choisir entre',
            'opposition', 'face à', 'contre', 'préfère', 'avantage', 'inconvénient'
        ]
        
        # Signaux de recommandation
        self.RECOMMENDATION_SIGNALS = [
            'conseil', 'recommande', 'suggère', 'propose', 'idéal', 'parfait',
            'meilleur choix', 'quel produit', 'lequel choisir', 'pour moi',
            'besoin', 'cherche quelque chose', 'adapté', 'convient', 'que choisir',
            'aide moi', 'aider', 'guide', 'orienter', 'diriger'
        ]
        
        # Signaux de prix
        self.PRICE_SIGNALS = [
            'prix', 'tarif', 'coût', 'cout', 'combien', '€', 'euro', 'cher',
            'abordable', 'budget', 'pas cher', 'bon marché', 'economique',
            'économique', 'moins de', 'under', 'moins cher', 'plus cher',
            'haut de gamme', 'premium', 'luxe', 'affordable'
        ]
        
        # Signaux de stock
        self.STOCK_SIGNALS = [
            'stock', 'disponible', 'dispo', 'livrable', 'en stock', 'rupture',
            'épuisé', 'epuise', 'availability', 'available', 'livraison'
        ]
        
        # Signaux de popularité
        self.POPULARITY_SIGNALS = [
            'populaire', 'plus vendu', 'plus commandé', 'tendance', 'top',
            'best seller', 'bestseller', 'meilleure vente', 'plus acheté',
            'demandé', 'préféré', 'choix client', 'avis client'
        ]
        
        # Signaux de spécifications techniques
        self.SPEC_SIGNALS = [
            'spec', 'spécification', 'technique', 'caractéristique',
            'feature', 'fonction', 'capacité', 'puissance', 'vitesse', 'dimension',
            'taille', 'poids', 'matériau', 'moteur', 'broche', 'rpm', 'mm', 'kg',
            'volt', 'ampere', 'watt', 'fréquence', 'résolution', 'précision'
        ]

    def process(self, message: str, session: dict) -> dict:
        """
        Traite n'importe quel message de l'utilisateur de manière intelligente.
        Aucune limitation, extraction automatique des intentions.
        """
        msg_lower = message.lower().strip()
        history = session.get('history', [])
        context = session.get('context', {})

        print(f"🔍 Traitement du message: '{message}'")

        # --- 1. Salutations simples ---
        if self._is_greeting(msg_lower) and len(msg_lower.split()) <= 5:
            return self._greeting_response(history)

        # --- 2. Questions sur le chatbot ---
        if self._is_self_question(msg_lower):
            return self._identity_response()

        # --- 3. Remerciements / Au revoir ---
        if self._is_thanks(msg_lower):
            return {'response': "De rien ! N'hésitez pas si vous avez d'autres questions. 😊", 'products': [], 'action': 'chat'}
        if self._is_goodbye(msg_lower):
            return {'response': "Au revoir ! À bientôt ! 👋", 'products': [], 'action': 'chat'}

        # --- 4. Demande d'aide ---
        if self._is_help_request(msg_lower):
            return {'response': self._help_message(), 'products': [], 'action': 'chat'}

        # --- 5. Détection intelligente de l'intention ---
        intent = self._detect_intent(message, msg_lower, context, history)
        
        if intent['type'] == 'comparison':
            return self._handle_comparison(intent, context, history)
        elif intent['type'] == 'recommendation':
            return self._handle_recommendation(intent, context)
        elif intent['type'] == 'list_all':
            return self._list_all_products()
        elif intent['type'] == 'list_categories':
            return self._list_categories()
        elif intent['type'] == 'category_products':
            return self._show_category_products(intent['category'])
        elif intent['type'] == 'price_filter':
            return self._handle_price_filter(intent)
        elif intent['type'] == 'stock_filter':
            return self._handle_stock_filter(intent)
        elif intent['type'] == 'popularity_filter':
            return self._handle_popularity_filter(intent)
        elif intent['type'] == 'spec_search':
            return self._handle_spec_search(intent)
        elif intent['type'] == 'product_details':
            return self._show_product_details(intent['product'])
        else:
            # Recherche générale
            return self._general_search(message, msg_lower, context)

    def _detect_intent(self, message, msg_lower, context, history):
        """
        Détecte intelligemment l'intention de l'utilisateur
        """
        intent = {
            'type': 'search',
            'query': message,
            'keywords': [],
            'filters': {}
        }

        # 1. Détection de comparaison
        if self._is_comparison_request(msg_lower):
            products = self._extract_products_for_comparison(msg_lower, context, history)
            if len(products) >= 2:
                intent['type'] = 'comparison'
                intent['products'] = products
                intent['criteria'] = self._extract_comparison_criteria(msg_lower)
                return intent
            elif context.get('last_products') and len(context.get('last_products')) >= 2:
                intent['type'] = 'comparison'
                intent['products'] = context.get('last_products')[:3]
                intent['criteria'] = self._extract_comparison_criteria(msg_lower)
                return intent

        # 2. Détection de recommandation
        if self._is_recommendation_request(msg_lower):
            intent['type'] = 'recommendation'
            intent['filters'] = self._extract_filters(msg_lower)
            return intent

        # 3. Détection de liste de tous les produits
        if self._is_list_all_request(msg_lower):
            intent['type'] = 'list_all'
            return intent

        # 4. Détection de liste des catégories
        if self._is_list_categories_request(msg_lower):
            intent['type'] = 'list_categories'
            return intent

        # 5. Détection de catégorie spécifique
        category = self._extract_category(msg_lower)
        if category:
            intent['type'] = 'category_products'
            intent['category'] = category
            return intent

        # 6. Détection de filtre par prix
        price_filters = self._extract_price_filters(msg_lower)
        if price_filters:
            intent['type'] = 'price_filter'
            intent['filters'] = price_filters
            # Extraire aussi les mots-clés de recherche
            intent['query'] = self._extract_search_query_after_filters(msg_lower, price_filters)
            return intent

        # 7. Détection de filtre par stock
        if self._is_stock_request(msg_lower):
            intent['type'] = 'stock_filter'
            intent['in_stock'] = 'rupture' not in msg_lower and 'épuisé' not in msg_lower
            return intent

        # 8. Détection de filtre par popularité
        if self._is_popularity_request(msg_lower):
            intent['type'] = 'popularity_filter'
            return intent

        # 9. Détection de recherche par spécifications techniques
        if self._is_spec_request(msg_lower):
            intent['type'] = 'spec_search'
            intent['spec_keyword'] = self._extract_spec_keyword(msg_lower)
            return intent

        # 10. Détection de produit spécifique par nom
        product = self._extract_product_by_name(msg_lower)
        if product:
            intent['type'] = 'product_details'
            intent['product'] = product
            return intent

        # 11. Recherche générale - extraire tous les mots-clés
        intent['type'] = 'search'
        intent['keywords'] = self._extract_all_keywords(msg_lower)
        intent['filters'] = self._extract_filters(msg_lower)
        
        return intent

    def _is_greeting(self, msg_lower):
        greetings = ['bonjour', 'bonsoir', 'salut', 'coucou', 'hello', 'hi', 'hey', 'bon matin']
        return any(g in msg_lower for g in greetings)

    def _is_self_question(self, msg_lower):
        return any(q in msg_lower for q in ['qui es-tu', 'tu es qui', 'c\'est quoi', 'ton nom', 't\'appelles'])

    def _is_thanks(self, msg_lower):
        return any(w in msg_lower for w in ['merci', 'thanks', 'thank you'])

    def _is_goodbye(self, msg_lower):
        return any(w in msg_lower for w in ['au revoir', 'bye', 'à bientôt', 'adieu'])

    def _is_help_request(self, msg_lower):
        return any(w in msg_lower for w in ['aide', 'help', 'comment utiliser', 'que peux-tu', 'que sais tu faire'])

    def _is_comparison_request(self, msg_lower):
        return any(s in msg_lower for s in self.COMPARISON_SIGNALS)

    def _is_recommendation_request(self, msg_lower):
        return any(s in msg_lower for s in self.RECOMMENDATION_SIGNALS)

    def _is_list_all_request(self, msg_lower):
        triggers = [
            'tous les produits', 'toutes les produits', 'catalogue complet',
            'liste des produits', 'liste produits', 'liste de produits',
            'voir tous les produits', 'affiche les produits', 'montre les produits',
            'tous produits', 'voir produits', 'afficher produits', 'tout le catalogue'
        ]
        return any(t in msg_lower for t in triggers)

    def _is_list_categories_request(self, msg_lower):
        triggers = ['catégorie', 'categorie', 'categories', 'rayon', 'section', 'type de produit']
        return any(t in msg_lower for t in triggers) and not self._is_list_all_request(msg_lower)

    def _is_stock_request(self, msg_lower):
        return any(s in msg_lower for s in self.STOCK_SIGNALS)

    def _is_popularity_request(self, msg_lower):
        return any(s in msg_lower for s in self.POPULARITY_SIGNALS)

    def _is_spec_request(self, msg_lower):
        return any(s in msg_lower for s in self.SPEC_SIGNALS)

    def _extract_category(self, msg_lower):
        """Extrait la catégorie mentionnée dans le message"""
        # Vérifier d'abord les catégories exactes
        for cat in self.categories:
            if cat.lower() in msg_lower:
                return cat
        
        # Puis vérifier par mots-clés
        for cat_key, keywords in self.category_keywords.items():
            for kw in keywords:
                if kw in msg_lower:
                    # Trouver la catégorie correspondante
                    for cat in self.categories:
                        if cat_key in cat.lower():
                            return cat
        return None

    def _extract_product_by_name(self, msg_lower):
        """Extrait le nom du produit mentionné"""
        all_products = self.data_loader.get_all_products()
        sorted_products = sorted(all_products, key=lambda x: len(x.name), reverse=True)
        
        for product in sorted_products:
            name_lower = product.name.lower()
            if name_lower in msg_lower:
                pattern = r'\b' + re.escape(name_lower) + r'\b'
                if re.search(pattern, msg_lower):
                    return product
        return None

    def _extract_products_for_comparison(self, msg_lower, context, history):
        """Extrait les produits à comparer"""
        products = []
        all_products = self.data_loader.get_all_products()
        sorted_products = sorted(all_products, key=lambda x: len(x.name), reverse=True)
        
        for product in sorted_products:
            name_lower = product.name.lower()
            if name_lower in msg_lower:
                pattern = r'\b' + re.escape(name_lower) + r'\b'
                if re.search(pattern, msg_lower):
                    products.append(product)
        
        if len(products) >= 2:
            return products[:3]
        
        # Si pas de produits nommés, prendre du contexte
        if context.get('last_products'):
            return context.get('last_products')[:3]
        
        return []

    def _extract_comparison_criteria(self, msg_lower):
        """Extrait le critère de comparaison"""
        if any(w in msg_lower for w in ['prix', 'tarif', 'cout', 'coût', 'price', 'cher']):
            return 'prix'
        if any(w in msg_lower for w in ['stock', 'disponible', 'dispo']):
            return 'stock'
        if any(w in msg_lower for w in ['populaire', 'commande', 'vendu', 'order']):
            return 'order'
        if any(w in msg_lower for w in ['spec', 'technique', 'spécification']):
            return 'spec'
        if any(w in msg_lower for w in ['caractéristique', 'feature', 'fonction']):
            return 'caracteristique'
        return None

    def _extract_price_filters(self, msg_lower):
        """Extrait les filtres de prix"""
        filters = {}
        
        # Moins de X
        match = re.search(r'moins de (\d+)|under (\d+)|max (\d+)|budget (\d+)', msg_lower)
        if match:
            val = next((int(g) for g in match.groups() if g), None)
            if val:
                filters['max'] = val
        
        # Entre X et Y
        match = re.search(r'entre (\d+) et (\d+)|between (\d+) and (\d+)', msg_lower)
        if match:
            groups = [g for g in match.groups() if g]
            if len(groups) >= 2:
                filters['min'] = int(groups[0])
                filters['max'] = int(groups[1])
        
        return filters

    def _extract_search_query_after_filters(self, msg_lower, filters):
        """Extrait la requête de recherche après avoir retiré les filtres"""
        query = msg_lower
        if filters.get('max'):
            query = re.sub(r'moins de \d+|under \d+|max \d+|budget \d+', '', query)
        if filters.get('min') and filters.get('max'):
            query = re.sub(r'entre \d+ et \d+|between \d+ and \d+', '', query)
        return query.strip()

    def _extract_spec_keyword(self, msg_lower):
        """Extrait le mot-clé de spécification technique"""
        words = msg_lower.split()
        for word in words:
            if len(word) > 3 and word in self.SPEC_SIGNALS:
                continue
            for spec in self.SPEC_SIGNALS:
                if spec in word:
                    return word
        return None

    def _extract_filters(self, msg_lower):
        """Extrait tous les filtres possibles"""
        filters = {}
        
        # Filtre de prix
        price_filters = self._extract_price_filters(msg_lower)
        filters.update(price_filters)
        
        # Filtre de stock
        if 'en stock' in msg_lower or 'disponible' in msg_lower:
            filters['in_stock'] = True
        if 'rupture' in msg_lower or 'épuisé' in msg_lower:
            filters['in_stock'] = False
        
        return filters

    def _extract_all_keywords(self, msg_lower):
        """Extrait tous les mots-clés pertinents du message"""
        # Supprimer les mots vides
        stop_words = {'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'pour', 'par', 'sur', 'dans', 
                      'avec', 'sans', 'est', 'sont', 'avoir', 'et', 'ou', 'mais', 'donc', 'car'}
        
        words = re.findall(r'\b[a-zéèêëàâîïôûç]{3,}\b', msg_lower)
        keywords = [w for w in words if w not in stop_words]
        
        return keywords

    def _general_search(self, message, msg_lower, context):
        """Recherche générale intelligente"""
        # Extraire les mots-clés
        keywords = self._extract_all_keywords(msg_lower)
        filters = self._extract_filters(msg_lower)
        
        # Rechercher avec le moteur de recherche
        products = self.search_engine.search(message, limit=12)
        
        # Si pas de résultat, essayer avec chaque mot-clé
        if not products and keywords:
            for kw in keywords[:3]:
                products = self.search_engine.search(kw, limit=5)
                if products:
                    break
        
        # Si toujours pas de résultat, chercher par catégorie
        if not products:
            category = self._extract_category(msg_lower)
            if category:
                products = self.data_loader.get_products_by_category(category)
        
        # Appliquer les filtres
        if filters and products:
            if filters.get('max'):
                products = [p for p in products if p.price <= filters['max']]
            if filters.get('min'):
                products = [p for p in products if p.price >= filters['min']]
            if filters.get('in_stock') is True:
                products = [p for p in products if p.stock > 0]
            elif filters.get('in_stock') is False:
                products = [p for p in products if p.stock == 0]
        
        if products:
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
                response += "\n💬 Tapez *compare* pour le comparer avec un autre produit."
            else:
                response = f"**🔍 {len(products)} produits trouvés**\n\n"
                for i, p in enumerate(products[:10], 1):
                    stock = "✅" if p.stock > 0 else "❌"
                    response += f"{stock} **{i}. {p.name}** — {p.price}€ | {p.category}\n"
                
                response += f"\n💡 **Astuces** :\n"
                response += f"• Dites *compare ces produits* pour comparer les {min(3, len(products))} premiers\n"
                response += f"• Dites *meilleur produit* pour une recommandation\n"
                response += f"• Ou précisez votre recherche avec des mots-clés"
            
            return {'response': response, 'products': products[:15], 'action': 'show_products'}
        
        # Aucun résultat
        return {
            'response': f"Je n'ai pas trouvé de produit correspondant à votre recherche.\n\n"
                       f"**Suggestions :**\n"
                       f"• Essayez d'autres mots-clés\n"
                       f"• Tapez *liste des catégories* pour explorer\n"
                       f"• Tapez *tous les produits* pour voir le catalogue\n"
                       f"• Nous avons {len(self.data_loader.get_all_products())} produits disponibles",
            'products': [],
            'action': 'chat'
        }

    def _handle_comparison(self, intent, context, history):
        """Gère les demandes de comparaison"""
        products = intent.get('products', [])
        criteria = intent.get('criteria')
        
        if not products or len(products) < 2:
            return {
                'response': "**⚠️ Pour comparer, j'ai besoin d'au moins 2 produits.**\n\n"
                           "Vous pouvez :\n"
                           "• Nommer des produits : *compare De2-Ultra et PC1 Baby*\n"
                           "• Chercher d'abord des produits : *affiche les tours CNC*\n"
                           "• Comparer tout le catalogue : *comparer tous*",
                'products': [],
                'action': 'chat'
            }
        
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
            result = self._detailed_comparison(products)
        
        return result

    def _handle_recommendation(self, intent, context):
        """Gère les demandes de recommandation"""
        filters = intent.get('filters', {})
        
        all_products = self.data_loader.get_all_products()
        
        # Appliquer les filtres
        if filters.get('max'):
            all_products = [p for p in all_products if p.price <= filters['max']]
        if filters.get('min'):
            all_products = [p for p in all_products if p.price >= filters['min']]
        
        if not all_products:
            return {
                'response': f"Aucun produit ne correspond à vos critères.",
                'products': [],
                'action': 'chat'
            }
        
        # Scorer et recommander
        best = self._score_and_recommend(all_products)
        
        response = "**💡 RECOMMANDATION PERSONNALISÉE**\n\n"
        if filters.get('max'):
            response += f"💰 **Budget** : jusqu'à {filters['max']}€\n\n"
        
        response += f"🏆 **Meilleur choix : {best[0].name}**\n"
        response += f"   💰 Prix : {best[0].price}€\n"
        response += f"   📦 Stock : {best[0].stock} unités\n"
        response += f"   ⭐ Note : {best[0].rating}/5\n"
        response += f"   🛒 Commandes : {best[0].order_count}\n"
        
        if len(best) > 1:
            response += "\n**Autres bonnes options :**\n"
            for p in best[1:4]:
                response += f"• **{p.name}** — {p.price}€ | ⭐{p.rating}\n"
        
        return {'response': response, 'products': best[:5], 'action': 'show_products'}

    def _handle_price_filter(self, intent):
        """Gère les filtres de prix"""
        filters = intent.get('filters', {})
        query = intent.get('query', '')
        
        all_products = self.data_loader.get_all_products()
        
        if filters.get('max'):
            products = [p for p in all_products if p.price <= filters['max']]
            label = f"moins de {filters['max']}€"
        elif filters.get('min') and filters.get('max'):
            products = [p for p in all_products if filters['min'] <= p.price <= filters['max']]
            label = f"entre {filters['min']}€ et {filters['max']}€"
        else:
            products = all_products
        
        # Filtrer par mots-clés si présents
        if query:
            keywords = self._extract_all_keywords(query)
            if keywords:
                filtered = []
                for p in products:
                    text = p.get_searchable_text().lower()
                    if any(kw in text for kw in keywords):
                        filtered.append(p)
                products = filtered
        
        if not products:
            return {
                'response': f"Aucun produit trouvé {label}.",
                'products': [],
                'action': 'chat'
            }
        
        products_sorted = sorted(products, key=lambda x: x.price)
        
        response = f"**💰 PRODUITS {label.upper()}** — {len(products_sorted)} trouvés\n\n"
        for p in products_sorted[:15]:
            stock = "✅" if p.stock > 0 else "❌"
            response += f"{stock} **{p.name}** — **{p.price}€** | {p.category}\n"
        
        return {'response': response, 'products': products_sorted[:15], 'action': 'show_products'}

    def _handle_stock_filter(self, intent):
        """Gère les filtres de stock"""
        all_products = self.data_loader.get_all_products()
        in_stock = intent.get('in_stock', True)
        
        if in_stock:
            products = [p for p in all_products if p.stock > 0]
            products = sorted(products, key=lambda x: x.stock, reverse=True)
            label = "DISPONIBLES EN STOCK"
        else:
            products = [p for p in all_products if p.stock == 0]
            label = "EN RUPTURE DE STOCK"
        
        response = f"**📦 PRODUITS {label}** — {len(products)} produits\n\n"
        for p in products[:15]:
            stock_icon = "✅" if p.stock > 0 else "❌"
            response += f"{stock_icon} **{p.name}** — {p.stock} unités | {p.price}€\n"
        
        return {'response': response, 'products': products[:15], 'action': 'show_products'}

    def _handle_popularity_filter(self, intent):
        """Gère les filtres de popularité"""
        all_products = self.data_loader.get_all_products()
        products = sorted(all_products, key=lambda x: x.order_count, reverse=True)
        
        response = f"**🔥 PRODUITS LES PLUS COMMANDÉS**\n\n"
        for i, p in enumerate(products[:15], 1):
            response += f"**#{i}** {p.name} — {p.order_count} commandes | {p.price}€ | ⭐{p.rating}\n"
        
        return {'response': response, 'products': products[:15], 'action': 'show_products'}

    def _handle_spec_search(self, intent):
        """Gère la recherche par spécifications techniques"""
        keyword = intent.get('spec_keyword')
        if not keyword:
            return self._general_search(intent.get('query', ''), intent.get('query', ''), {})
        
        all_products = self.data_loader.get_all_products()
        matching_products = []
        
        for p in all_products:
            for f in p.features:
                if keyword.lower() in f.lower():
                    matching_products.append(p)
                    break
            else:
                for k, v in p.specifications.items():
                    if keyword.lower() in k.lower() or keyword.lower() in str(v).lower():
                        matching_products.append(p)
                        break
                else:
                    for k, v in p.technicalSpecs.items():
                        if keyword.lower() in k.lower() or keyword.lower() in str(v).lower():
                            matching_products.append(p)
                            break
        
        if matching_products:
            response = f"**🔧 PRODUITS AVEC « {keyword} »** — {len(matching_products)} trouvés\n\n"
            for p in matching_products[:15]:
                response += f"• **{p.name}** — {p.price}€ | {p.category}\n"
                for f in p.features:
                    if keyword.lower() in f.lower():
                        response += f"  ✓ {f[:60]}...\n"
                        break
            return {'response': response, 'products': matching_products[:15], 'action': 'show_products'}
        
        return {
            'response': f"Aucun produit trouvé avec la caractéristique « {keyword} ».\n\n"
                       f"Essayez d'autres termes comme : puissance, vitesse, cnc, tour, etc.",
            'products': [],
            'action': 'chat'
        }

    def _show_category_products(self, category):
        """Affiche les produits d'une catégorie"""
        products = self.data_loader.get_products_by_category(category)
        
        if not products:
            return {
                'response': f"Aucun produit trouvé dans la catégorie {category}.",
                'products': [],
                'action': 'chat'
            }
        
        response = f"**📁 {category.upper()}** — {len(products)} produit(s)\n\n"
        for i, p in enumerate(products[:20], 1):
            stock = "✅" if p.stock > 0 else "❌"
            response += f"{stock} **{i}. {p.name}** — {p.price}€\n"
        
        response += "\n💡 **Astuce** : Dites *compare ces produits* pour comparer cette sélection."
        
        return {'response': response, 'products': products[:20], 'action': 'show_products', 'category': category}

    def _show_product_details(self, product):
        """Affiche les détails d'un produit"""
        response = f"**{product.name}**\n\n"
        response += f"💰 Prix : **{product.price}€**\n"
        response += f"📦 Stock : {product.stock} unités\n"
        response += f"🏷️ Catégorie : {product.category}\n"
        response += f"⭐ Note : {product.rating}/5\n"
        response += f"🛒 Commandes : {product.order_count}\n"
        if product.description:
            response += f"\n📝 {product.description[:300]}...\n"
        if product.features:
            response += "\n**Caractéristiques :**\n"
            for f in product.features[:8]:
                response += f"• {f}\n"
        if product.specifications:
            response += "\n**Spécifications :**\n"
            for k, v in list(product.specifications.items())[:8]:
                response += f"• {k}: {v}\n"
        
        return {'response': response, 'products': [product], 'action': 'show_product'}

    def _list_all_products(self):
        """Liste tous les produits"""
        products = self.data_loader.get_all_products()
        total = len(products)
        
        response = f"**📋 CATALOGUE COMPLET** — {total} produits\n\n"
        
        if total > 20:
            response += f"💡 *J'affiche les 20 premiers produits.*\n\n"
            displayed = products[:20]
        else:
            displayed = products
        
        for i, p in enumerate(displayed, 1):
            stock = "✅" if p.stock > 0 else "❌"
            response += f"{stock} **{i}. {p.name}** — {p.price}€ | {p.category}\n"
        
        response += "\n💡 **Astuces** :\n"
        response += "• Dites *compare ces produits* pour comparer les premiers\n"
        response += "• Dites *comparer tous* pour une analyse globale\n"
        response += "• Ou précisez une catégorie : *produits CNC*"
        
        return {'response': response, 'products': displayed, 'action': 'show_products'}

    def _list_categories(self):
        """Liste toutes les catégories"""
        cats = self.data_loader.get_all_categories()
        cat_data = []
        for cat in sorted(cats):
            count = len(self.data_loader.get_products_by_category(cat))
            if count > 0:
                cat_data.append({'name': cat.title(), 'raw_name': cat, 'count': count})
        
        cat_data.sort(key=lambda x: x['count'], reverse=True)
        
        response = f"**📋 CATÉGORIES DISPONIBLES** ({len(cat_data)} catégories)\n\n"
        for cat in cat_data:
            response += f"• **{cat['name']}** : {cat['count']} produits\n"
        
        response += "\n💡 Dites *affiche les [catégorie]* pour voir les produits."
        
        return {'response': response, 'products': [], 'action': 'list_categories', 'categories': cat_data}

    def _greeting_response(self, history):
        """Réponse de salutation"""
        if len(history) <= 1:
            total = len(self.data_loader.get_all_products())
            cats = len(self.data_loader.get_all_categories())
            response = (
                f"Bonjour ! 👋 Je suis votre assistant produit.\n\n"
                f"Je peux vous aider à explorer notre catalogue de **{total} produits** "
                f"dans **{cats} catégories**.\n\n"
                f"**Exemples de questions :**\n"
                f"• *affiche les tours CNC*\n"
                f"• *produits moins de 5000€*\n"
                f"• *compare De2-Ultra et PC1 Baby*\n"
                f"• *meilleur produit pour l'éducation*\n"
                f"• *tous les produits en stock*\n\n"
                f"Que cherchez-vous ?"
            )
        else:
            response = "Re-bonjour ! Comment puis-je vous aider aujourd'hui ?"
        
        return {'response': response, 'products': [], 'action': 'chat'}

    def _identity_response(self):
        """Réponse à qui es-tu"""
        total = len(self.data_loader.get_all_products())
        cats = len(self.data_loader.get_all_categories())
        return {
            'response': (
                f"🤖 **Assistant Produit**\n\n"
                f"Je suis votre guide pour explorer notre catalogue de **{total} produits** "
                f"répartis dans **{cats} catégories**.\n\n"
                f"**Ce que je peux faire :**\n"
                f"• 🔍 **Rechercher** des produits (par nom, catégorie, caractéristiques)\n"
                f"• 📊 **Comparer** des produits (prix, specs, popularité)\n"
                f"• 💡 **Recommander** le meilleur produit selon vos besoins\n"
                f"• 💰 **Filtrer** par prix, stock, popularité\n"
                f"• 📋 **Parcourir** les catégories et le catalogue\n\n"
                f"Posez-moi n'importe quelle question en français !"
            ),
            'products': [],
            'action': 'chat'
        }

    def _help_message(self):
        """Message d'aide"""
        total = len(self.data_loader.get_all_products())
        return (
            f"**🤖 ASSISTANT PRODUIT** — {total} produits disponibles\n\n"
            "**🔍 RECHERCHE**\n"
            "• *tour CNC* / *oscilloscope* / *capteur voiture*\n"
            "• *produits moins de 5000€*\n"
            "• *produits en stock* / *rupture de stock*\n"
            "• *les plus vendus* / *populaires*\n\n"
            "**📊 COMPARAISON**\n"
            "• *compare De2-Ultra et PC1 Baby*\n"
            "• *quel est le moins cher entre X et Y*\n"
            "• *comparer selon le prix* / *selon les specs*\n"
            "• *comparer tous* (vue globale du catalogue)\n\n"
            "**💡 RECOMMANDATION**\n"
            "• *conseille moi un produit pour l'éducation*\n"
            "• *meilleur rapport qualité prix*\n"
            "• *que choisir pour débuter en CNC*\n\n"
            "**📋 EXPLORER**\n"
            "• *liste des catégories*\n"
            "• *tous les produits*\n"
            "• *affiche les produits CNC*\n\n"
            "Posez votre question en langage naturel !"
        )

    # Méthodes utilitaires existantes
    def _score_and_recommend(self, products):
        """Score les produits pour recommandation"""
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

    def _price_comparison(self, products):
        """Comparaison des prix"""
        comparison = self.comparator.compare(products, 'prix')
        if not comparison:
            return self._detailed_comparison(products)
        
        response = "**💰 COMPARAISON DES PRIX**\n\n"
        price_comp = comparison.get('price_comparison', {})
        if price_comp:
            for name, price in price_comp.get('prices', {}).items():
                response += f"• **{name}** : {price}€\n"
            response += f"\n**Moins cher** : **{price_comp.get('cheapest')}**\n"
            response += f"**Écart de prix** : {price_comp.get('difference', 0):.0f}€\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison_type': 'price'
        }

    def _stock_comparison(self, products):
        """Comparaison des stocks"""
        response = "**📦 COMPARAISON DES STOCKS**\n\n"
        for p in products:
            status = "✅ En stock" if p.stock > 0 else "❌ Rupture"
            response += f"• **{p.name}** : {status} ({p.stock} unités)\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison_type': 'stock'
        }

    def _specs_comparison(self, products):
        """Comparaison des spécifications"""
        comparison = self.comparator.compare(products, 'spec')
        if not comparison:
            return self._detailed_comparison(products)
        
        response = "**🔧 COMPARAISON DES SPÉCIFICATIONS**\n\n"
        specs = comparison.get('specs_comparison', {})
        displayed = 0
        for spec_name, values in specs.items():
            if displayed >= 8:
                break
            clean_name = spec_name.replace('[Tech] ', '')
            response += f"**{clean_name}**\n"
            for prod_name, value in values.items():
                response += f"  • {prod_name}: {value}\n"
            response += "\n"
            displayed += 1
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison_type': 'specs'
        }

    def _features_comparison(self, products):
        """Comparaison des caractéristiques"""
        comparison = self.comparator.compare(products, 'feature')
        if not comparison:
            return self._detailed_comparison(products)
        
        response = "**✅ COMPARAISON DES CARACTÉRISTIQUES**\n\n"
        features = comparison.get('features_comparison', {})
        displayed = 0
        for feature, presence in features.items():
            if displayed >= 10:
                break
            has_feature = [name for name, present in presence.items() if present]
            if len(has_feature) < len(products):
                response += f"**{feature[:60]}**\n"
                for name in presence.keys():
                    if presence[name]:
                        response += f"  ✅ {name}\n"
                response += "\n"
                displayed += 1
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison_type': 'features'
        }

    def _popularity_comparison(self, products):
        """Comparaison de popularité"""
        response = "**🔥 COMPARAISON DE POPULARITÉ**\n\n"
        sorted_products = sorted(products, key=lambda x: x.order_count, reverse=True)
        for i, p in enumerate(sorted_products, 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
            response += f"{medal} **{p.name}** : {p.order_count} commandes | ⭐{p.rating}\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison_type': 'popularity'
        }

    def _detailed_comparison(self, products):
        """Comparaison détaillée complète"""
        comparison = self.comparator.compare(products)
        if not comparison:
            return {
                'response': "Impossible d'effectuer la comparaison.",
                'products': products,
                'action': 'chat'
            }
        
        response = "**📊 COMPARAISON DÉTAILLÉE**\n\n"
        
        # Prix
        price_comp = comparison.get('price_comparison', {})
        if price_comp:
            response += "**💰 Prix :**\n"
            for name, price in price_comp.get('prices', {}).items():
                marker = " ✓ (moins cher)" if name == price_comp.get('cheapest') else ""
                response += f"  • {name}: {price}€{marker}\n"
            response += "\n"
        
        # Stock
        response += "**📦 Stock :**\n"
        for p in products:
            status = "✅" if p.stock > 0 else "❌"
            response += f"  • {p.name}: {status} ({p.stock} unités)\n"
        response += "\n"
        
        # Popularité
        response += "**🔥 Popularité :**\n"
        for p in products:
            response += f"  • {p.name}: {p.order_count} commandes | ⭐{p.rating}\n"
        response += "\n"
        
        # Recommandation
        recommendation = comparison.get('recommendation', {})
        if recommendation:
            response += "─" * 40 + "\n"
            response += f"🏆 **Mon conseil** : {recommendation.get('best_product')}\n"
            response += f"💡 {recommendation.get('explanation', '')}\n"
        
        return {
            'response': response,
            'products': products,
            'action': 'show_comparison',
            'comparison': comparison
        }