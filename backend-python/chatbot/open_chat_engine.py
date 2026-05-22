import re
from utils.text_processor import TextProcessor
from utils.scoring import ScoringService

class OpenChatEngine:
    def __init__(self, data_loader, search_engine, comparator, recommendation_service):
        self.data_loader = data_loader
        self.search_engine = search_engine
        self.comparator = comparator
        self.recommendation_service = recommendation_service
        self.text_processor = TextProcessor()

        # Signaux multilingues
        self.COMPARISON_SIGNALS = [
            'compar', 'vs', 'versus', 'différence', 'diff', 'lequel', 'laquelle',
            'mieux', 'meilleur entre', 'entre', 'ou bien', 'ou le', 'choisir entre',
            'opposition', 'face à', 'contre', 'préfère', 'avantage', 'inconvénient',
            'compare', 'difference', 'which', 'better', 'between', 'choose', 'versus'
        ]
        self.RECOMMENDATION_SIGNALS = [
            'conseil', 'recommande', 'suggère', 'propose', 'idéal', 'parfait',
            'meilleur choix', 'quel produit', 'lequel choisir', 'pour moi',
            'besoin', 'cherche quelque chose', 'adapté', 'convient', 'que choisir',
            'aide moi', 'aider', 'guide', 'orienter', 'diriger',
            'recommend', 'suggest', 'ideal', 'perfect', 'best choice', 'which product',
            'for me', 'need', 'looking for', 'suitable', 'help me', 'guide'
        ]
        self.PRICE_SIGNALS = [
            'prix', 'tarif', 'coût', 'cout', 'combien', '€', 'euro', 'cher',
            'abordable', 'budget', 'pas cher', 'bon marché', 'economique',
            'économique', 'moins de', 'under', 'moins cher', 'plus cher',
            'haut de gamme', 'premium', 'luxe', 'affordable',
            'price', 'cost', 'how much', 'expensive', 'cheap', 'budget'
        ]
        self.STOCK_SIGNALS = [
            'stock', 'disponible', 'dispo', 'livrable', 'en stock', 'rupture',
            'épuisé', 'epuise', 'availability', 'available', 'livraison', 'commande',
            'in stock', 'out of stock', 'available', 'delivery'
        ]
        self.ORDER_SIGNALS = [
            'populaire', 'plus vendu', 'plus commandé', 'tendance', 'top',
            'best seller', 'bestseller', 'meilleure vente', 'plus acheté',
            'demandé', 'préféré', 'choix client', 'avis client', 'order',
            'popular', 'best selling', 'trending', 'most ordered', 'top rated'
        ]
        self.SPEC_SIGNALS = [
            'specification', 'spécification', 'spec', 'technique', 'caractéristique',
            'feature', 'fonction', 'capacité', 'puissance', 'vitesse', 'dimension',
            'taille', 'poids', 'matériau', 'matiere', 'composant', 'moteur',
            'broche', 'cnc', 'tour', 'fraise', 'capteur', 'injection', 'diagnostic',
            'oscilloscope', 'sonde', 'mesure', 'résolution', 'précision', 'tension',
            'courant', 'fréquence', 'rpm', 'mm', 'kg', 'volt', 'ampere', 'watt',
            'technical', 'features', 'capacity', 'power', 'speed', 'dimension',
            'weight', 'material', 'component', 'motor', 'sensor', 'resolution'
        ]
        self.LIST_SIGNALS = [
            'liste', 'list', 'tous les', 'toutes les', 'catalogue', 'catalogue',
            'affiche', 'montre', 'voir tous', 'voir toutes', 'menu', 'rayon',
            'catégorie', 'categorie', 'quels produits', 'quelles produits',
            'avez-vous', 'as-tu', 'proposez-vous', 'gamme', 'collection',
            'show', 'display', 'all products', 'catalog', 'category', 'list'
        ]
        self.GREETING_SIGNALS = [
            'bonjour', 'bonsoir', 'salut', 'coucou', 'hello', 'hi', 'hey',
            'bon matin', 'bonne journée', 'good morning', 'good evening',
            'مرحبا', 'اهلا', 'سلام'
        ]

    def _detect_language(self, text):
        arabic_words = ['مرحبا', 'اهلا', 'سلام', 'شكرا', 'السعر', 'منتج']
        if any(w in text for w in arabic_words):
            return 'ar'
        english_words = ['hello', 'hi', 'hey', 'good morning', 'how are you', 
                        'what is', 'show me', 'i want', 'please', 'thanks', 'thank you',
                        'price', 'cheap', 'expensive', 'product', 'catalog']
        if any(w in text.lower() for w in english_words):
            return 'en'
        return 'fr'

    def _get_response(self, key, language, **kwargs):
        responses = {
            'fr': {
                'thanks': "De rien ! N'hésitez pas si vous avez d'autres questions.",
                'farewell': "Au revoir ! À bientôt !",
                'not_found': "Je n'ai pas trouvé de produit pour « {query} ».",
                'no_products': "Aucun produit dans cette tranche de prix.",
                'no_comparison': "Je ne vois pas quels produits comparer.",
                'error': "Désolé, une erreur technique est survenue."
            },
            'en': {
                'thanks': "You're welcome! Feel free to ask if you have more questions.",
                'farewell': "Goodbye! See you soon!",
                'not_found': "I couldn't find any product for '{query}'.",
                'no_products': "No products in this price range.",
                'no_comparison': "I don't see which products to compare.",
                'error': "Sorry, a technical error occurred."
            },
            'ar': {
                'thanks': "عفوا! لا تتردد في السؤال إذا كان لديك أسئلة أخرى.",
                'farewell': "مع السلامة! أراك قريباً!",
                'not_found': "لم أجد أي منتج لـ '{query}'.",
                'no_products': "لا توجد منتجات في هذا النطاق السعري.",
                'no_comparison': "لا أرى أي منتجات للمقارنة.",
                'error': "عذراً، حدث خطأ تقني."
            }
        }
        return responses.get(language, responses['fr']).get(key, "").format(**kwargs)

    def process(self, message: str, session: dict) -> dict:
        msg_lower = message.lower().strip()
        history = session.get('history', [])
        context = session.get('context', {})
        
        user_lang = self._detect_language(message)
        if 'language' not in context:
            context['language'] = user_lang

        # Est-ce que / is it
        if msg_lower.startswith('est-ce que') or msg_lower.startswith("est ce que") or msg_lower.startswith('is it'):
            query = msg_lower.replace('est-ce que', '').replace('est ce que', '').replace('is it', '').strip()
            return self._handle_free_search(message, query, context, history, user_lang)

        # Salutations
        if self._has_signal(msg_lower, self.GREETING_SIGNALS) and len(msg_lower.split()) <= 5:
            return self._greeting_response(history, user_lang)

        # Qui es-tu ?
        identity_phrases = {
            'fr': ['qui es-tu', 'tu es qui', 'c\'est quoi', 'ton nom', 't\'appelles'],
            'en': ['who are you', 'what are you', 'your name', 'identify yourself'],
            'ar': ['من أنت', 'ما اسمك']
        }
        if any(phrase in msg_lower for phrase in identity_phrases.get(user_lang, identity_phrases['fr'])):
            return self._identity_response(user_lang)

        # Merci
        thanks_words = {'fr': ['merci', 'thanks', 'thank'], 'en': ['thanks', 'thank you', 'thx'], 'ar': ['شكرا', 'شكر']}
        if any(w in msg_lower for w in thanks_words.get(user_lang, thanks_words['fr'])):
            return {'response': self._get_response('thanks', user_lang), 'products': [], 'action': 'chat'}

        # Au revoir
        farewell_words = {'fr': ['au revoir', 'bye', 'à bientôt', 'adieu'], 'en': ['goodbye', 'bye', 'see you', 'farewell'], 'ar': ['وداعا', 'مع السلامة']}
        if any(w in msg_lower for w in farewell_words.get(user_lang, farewell_words['fr'])):
            return {'response': self._get_response('farewell', user_lang), 'products': [], 'action': 'chat'}

        # Aide
        help_words = {'fr': ['aide', 'help', 'comment utiliser', 'que peux-tu', 'que sais tu faire'],
                      'en': ['help', 'how to use', 'what can you do', 'capabilities'],
                      'ar': ['مساعدة', 'كيف استخدم']}
        if any(w in msg_lower for w in help_words.get(user_lang, help_words['fr'])):
            return {'response': self._help_message(user_lang), 'products': [], 'action': 'chat'}

        # Comparaison
        intent_type, products, criteria = self._detect_comparison_intent(msg_lower, history, context)
        if intent_type:
            return self._handle_comparison_with_intent(intent_type, products, criteria, context, history, user_lang)

        # Catégories
        if self._is_category_list_request(msg_lower):
            return self._list_categories(user_lang)
        
        category_result = self._handle_category_query(message, session)
        if category_result:
            return category_result

        # Liste produits
        if self._is_product_list_request(msg_lower) and not self._has_specific_product_context(msg_lower):
            return self._list_all_products(user_lang)

        # Recommandations
        if self._has_signal(msg_lower, self.RECOMMENDATION_SIGNALS):
            return self._handle_recommendation(message, msg_lower, context)

        # Prix
        if self._has_signal(msg_lower, self.PRICE_SIGNALS):
            return self._handle_price_query(message, msg_lower, user_lang)

        # Stock
        if self._has_signal(msg_lower, self.STOCK_SIGNALS):
            return self._handle_stock_query(msg_lower, user_lang)

        # Popularité
        if self._has_signal(msg_lower, self.ORDER_SIGNALS):
            return self._handle_order_query(msg_lower, user_lang)

        # Spec/feature
        if self._has_signal(msg_lower, self.SPEC_SIGNALS):
            return self._handle_feature_spec_query(message, msg_lower)

        # Recherche générale
        return self._handle_free_search(message, msg_lower, context, history, user_lang)

    # ========== MÉTHODES UTILITAIRES ==========

    def _has_signal(self, text, signals):
        return any(s in text for s in signals)

    def _is_category_list_request(self, msg_lower):
        cat_words = ['catégorie', 'categorie', 'categories', 'rayon', 'section', 'type de produit', 'types de produit',
                     'category', 'categories', 'product type']
        if self._is_product_list_request(msg_lower):
            return False
        return any(w in msg_lower for w in cat_words)

    def _is_product_list_request(self, msg_lower):
        triggers = [
            'tous les produits', 'toutes les produits', 'catalogue complet',
            'liste des produits', 'liste produits', 'liste de produits',
            'voir tous les produits', 'affiche les produits', 'montre les produits',
            'tous produits', 'voir produits', 'afficher produits',
            'all products', 'list products', 'show products', 'catalog'
        ]
        return any(t in msg_lower for t in triggers)

    def _has_specific_product_context(self, msg_lower):
        product_words = ['cnc', 'tour', 'fraise', 'capteur', 'oscilloscope', 'voiture', 'auto',
                         'mcp', 'labo', 'éducatif', 'education', 'milling', 'turning', 'de2', 'pc1',
                         'fa2', 'px1', 'dt-', 'dtm', 'mt-', 'ptl', 'acl', 'f1-']
        return any(p in msg_lower for p in product_words)

    # ========== DÉTECTION DES INTENTIONS ==========

    def _detect_comparison_intent(self, msg_lower, history, context):
        match = re.search(r'comparer tous(?:\s+les\s+produits)?\s+(?:selon|par|sur)\s+([a-zéèêëàâîïôûç]+)', msg_lower)
        if match:
            criteria = match.group(1).strip().lower()
            criteria = self._normalize_criteria(criteria)
            return ('compare_all_by_criteria', None, criteria)
        
        if any(phrase in msg_lower for phrase in ['comparer tous', 'compare tous', 'comparer tout', 'compare tout', 'compare all']):
            return ('compare_all_catalog', None, None)
        
        products_mentioned = self._extract_product_names(msg_lower)
        if len(products_mentioned) >= 2:
            criteria = self._extract_comparison_criteria(msg_lower)
            if criteria:
                return ('specific_products_with_criteria', products_mentioned[:3], criteria)
            return ('specific_products', products_mentioned[:3], None)
        
        if any(phrase in msg_lower for phrase in ['ces produits', 'tous ces produits', 'les comparer', 'comparer ces', 'these products', 'compare these']):
            recent_products = context.get('last_products', [])
            if recent_products:
                criteria = self._extract_comparison_criteria(msg_lower)                
                if len(recent_products) > 3:
                    context['comparison_warning'] = "J'ai limité la comparaison aux 3 premiers produits pour plus de clarté."
                    if criteria:
                        return ('context_products_with_criteria', recent_products[:3], criteria)
                    return ('context_products', recent_products[:3], None)
                elif len(recent_products) >= 2:
                    if criteria:
                        return ('context_products_with_criteria', recent_products, criteria)
                    return ('context_products', recent_products, None)
        
        criteria = self._extract_comparison_criteria(msg_lower)
        if criteria:
            if context.get('last_products') and len(context.get('last_products')) >= 2:
                recent = context.get('last_products')
                if len(recent) > 3:
                    context['comparison_warning'] = "J'ai limité la comparaison aux 3 premiers produits."
                    return ('context_products_with_criteria', recent[:3], criteria)
                return ('context_products_with_criteria', recent, criteria)
            else:
                return ('criteria_without_products', None, criteria)
        
        if any(word in msg_lower for word in ['meilleur', 'top', 'lequel', 'choisir', 'gagnant', 'best', 'which', 'choose', 'winner']):
            products_source = products_mentioned if products_mentioned else context.get('last_products', [])
            if products_source:
                criteria = self._extract_comparison_criteria(msg_lower)
                if len(products_source) > 3:
                    context['comparison_warning'] = "Analyse des 3 premiers produits pour trouver le meilleur."
                    return ('find_best', products_source[:3], criteria)
                return ('find_best', products_source, criteria)
        
        return None, None, None

    def _normalize_criteria(self, criteria):
        criteria = criteria.lower()
        if any(word in criteria for word in ['prix', 'tarif', 'cout', 'coût', 'price', 'cher', 'cost']):
            return 'prix'
        if any(word in criteria for word in ['stock', 'disponible', 'dispo', 'rupture', 'available']):
            return 'stock'
        if any(word in criteria for word in ['order', 'commande', 'populaire', 'vendu', 'acheté', 'popularité', 'popular']):
            return 'order'
        if any(word in criteria for word in ['spec', 'spécification', 'technique', 'tech', 'caractéristique technique', 'technical']):
            return 'spec'
        if any(word in criteria for word in ['caractéristique', 'feature', 'fonction', 'caracteristique']):
            return 'caracteristique'
        if len(criteria) > 2:
            return criteria
        return None

    def _extract_product_names(self, msg_lower):
        products_found = []
        all_products = self.data_loader.get_all_products()
        sorted_products = sorted(all_products, key=lambda x: len(x.name), reverse=True)
        for product in sorted_products:
            name_lower = product.name.lower()
            if name_lower in msg_lower and product not in products_found:
                pattern = r'\b' + re.escape(name_lower) + r'\b'
                if re.search(pattern, msg_lower):
                    products_found.append(product)
        return products_found

    def _extract_comparison_criteria(self, msg_lower):
        match = re.search(r'(?:comparer|compare|selon|par|sur|by|on)\s+(?:selon|par|sur|by|on)?\s*(le|la|les)?\s*([a-zéèêëàâîïôûç]{3,})', msg_lower)
        if match:
            criteria = match.group(2) if match.group(2) else match.group(1)
            return self._normalize_criteria(criteria)
        if any(word in msg_lower for word in ['prix', 'tarif', 'cout', 'coût', 'price', 'cost']):
            return 'prix'
        if any(word in msg_lower for word in ['stock', 'disponible', 'dispo', 'available']):
            return 'stock'
        if any(word in msg_lower for word in ['populaire', 'commande', 'vendu', 'order', 'popular']):
            return 'order'
        if any(word in msg_lower for word in ['spec', 'technique', 'spécification', 'technical']):
            return 'spec'
        if any(word in msg_lower for word in ['caractéristique', 'feature', 'fonction']):
            return 'caracteristique'
        return None

    def _extract_price_constraint(self, msg_lower):
        patterns = [
            r'moins de (\d+)', r'maximum (\d+)', r'max (\d+)', r'under (\d+)',
            r'(\d+)\s*€', r'budget.*?(\d+)', r'(\d+)\s*euros?',
            r'less than (\d+)', r'under (\d+)', r'budget (\d+)'
        ]
        for p in patterns:
            m = re.search(p, msg_lower)
            if m:
                return {'max': int(m.group(1))}
        range_m = re.search(r'entre\s*(\d+)\s*(?:et|and|[àa]|-)\s*(\d+)|between\s*(\d+)\s*(?:and|-)\s*(\d+)', msg_lower)
        if range_m:
            groups = [g for g in range_m.groups() if g]
            if len(groups) >= 2:
                return {'min': int(groups[0]), 'max': int(groups[1])}
        return None

    # ========== RÉPONSES MULTILINGUES ==========

    def _greeting_response(self, history, language='fr'):
        total_products = len(self.data_loader.get_all_products())
        categories = len(self.data_loader.get_all_categories())
        greetings = {
            'fr': {'first': f"Bonjour ! 👋 Je suis votre assistant UniverTechno+.\n\nJe peux vous aider à :\n• 🔍 **Rechercher** un produit\n• 📊 **Comparer** des produits\n• 📊 **Comparer TOUS** les produits\n• 💡 **Recommander** le meilleur produit\n• 💰 **Filtrer** par prix, stock, popularité\n• 📋 **Parcourir** les catégories\n\nNous avons **{total_products} produits** dans **{categories} catégories**.\n\nQue cherchez-vous ?", 'return': "Re-bonjour ! Comment puis-je vous aider aujourd'hui ?"},
            'en': {'first': f"Hello! 👋 I'm your UniverTechno+ assistant.\n\nI can help you with:\n• 🔍 **Search** for products\n• 📊 **Compare** products\n• 📊 **Compare ALL** products\n• 💡 **Recommend** the best product\n• 💰 **Filter** by price, stock, popularity\n• 📋 **Browse** categories\n\nWe have **{total_products} products** in **{categories} categories**.\n\nWhat are you looking for?", 'return': "Welcome back! How can I help you today?"},
            'ar': {'first': f"مرحباً! 👋 أنا مساعد UniverTechno+.\n\nيمكنني مساعدتك في:\n• 🔍 **البحث** عن منتج\n• 📊 **مقارنة** المنتجات\n• 📊 **مقارنة جميع** المنتجات\n• 💡 **توصية** بأفضل منتج\n• 💰 **تصفية** حسب السعر والمخزون والشعبية\n• 📋 **تصفح** الفئات\n\nلدينا **{total_products} منتج** في **{categories} فئة**.\n\nبماذا تبحث؟", 'return': "مرحباً بعودتك! كيف يمكنني مساعدتك اليوم؟"}
        }
        if len(history) <= 1:
            response = greetings.get(language, greetings['fr'])['first']
        else:
            response = greetings.get(language, greetings['fr'])['return']
        return {'response': response, 'products': [], 'action': 'chat'}

    def _identity_response(self, language='fr'):
        total = len(self.data_loader.get_all_products())
        cats = len(self.data_loader.get_all_categories())
        responses = {
            'fr': {'response': f"🤖 **Assistant Produit**\n\nJe suis votre guide pour explorer notre catalogue de **{total} produits** répartis dans **{cats} catégories**.\n\n**Ce que je peux faire :**\n• 🔍 Rechercher des produits\n• 📊 Comparer des produits\n• 📊 Comparer TOUS les produits\n• 💡 Recommander le meilleur produit\n• 📋 Lister les catégories et produits\n\nPosez-moi des questions en langage naturel !"},
            'en': {'response': f"🤖 **Product Assistant**\n\nI am your guide to explore our catalog of **{total} products** spread across **{cats} categories**.\n\n**What I can do:**\n• 🔍 Search for products\n• 📊 Compare products\n• 📊 Compare ALL products\n• 💡 Recommend the best product\n• 📋 List categories and products\n\nAsk me questions in natural language!"},
            'ar': {'response': f"🤖 **مساعد المنتجات**\n\nأنا دليلك لاستكشاف كتالوجنا الذي يحتوي على **{total} منتج** موزعة على **{cats} فئة**.\n\n**ماذا يمكنني أن أفعل؟**\n• 🔍 البحث عن المنتجات\n• 📊 مقارنة المنتجات\n• 📊 مقارنة جميع المنتجات\n• 💡 التوصية بأفضل منتج\n• 📋 سرد الفئات والمنتجات\n\nاطرح عليّ أسئلة بلغة طبيعية!"}
        }
        return {'response': responses.get(language, responses['fr'])['response'], 'products': [], 'action': 'chat'}

    def _help_message(self, language='fr'):
        total = len(self.data_loader.get_all_products())
        messages = {
            'fr': f"**🤖 ASSISTANT PRODUIT** — {total} produits disponibles\n\n**RECHERCHE LIBRE**\n• *tour CNC*\n• *oscilloscope pour labo*\n• *capteur voiture*\n\n**COMPARAISON**\n• *compare De2-Ultra et PC1 Baby*\n• *comparer tous*\n• *comparer tous selon le prix*\n\n**FILTRES**\n• *produits moins de 5000€*\n• *produits en stock*\n• *les plus vendus*\n\n**EXPLORER**\n• *liste des catégories*\n• *tous les produits CNC*",
            'en': f"**🤖 PRODUCT ASSISTANT** — {total} products available\n\n**FREE SEARCH**\n• *CNC lathe*\n• *oscilloscope for lab*\n• *car sensor*\n\n**COMPARISON**\n• *compare De2-Ultra and PC1 Baby*\n• *compare all*\n• *compare all by price*\n\n**FILTERS**\n• *products under 5000€*\n• *products in stock*\n• *best sellers*\n\n**EXPLORE**\n• *list of categories*\n• *all CNC products*",
            'ar': f"**🤖 مساعد المنتجات** — {total} منتج متاح\n\n**البحث الحر**\n• *مخرطة CNC*\n• *راسم اهتزاز للمختبر*\n• *حساس سيارة*\n\n**المقارنة**\n• *قارن De2-Ultra و PC1 Baby*\n• *قارن الكل*\n• *قارن الكل حسب السعر*\n\n**التصفية**\n• *منتجات أقل من 5000€*\n• *منتجات في المخزون*\n• *الأكثر مبيعاً*\n\n**استكشاف**\n• *قائمة الفئات*\n• *جميع منتجات CNC*"
        }
        return messages.get(language, messages['fr'])

    def _list_categories(self, language='fr'):
        cats = self.data_loader.get_all_categories()
        cat_data = []
        for cat in sorted(cats):
            count = len(self.data_loader.get_products_by_category(cat))
            if count > 0:
                cat_data.append({'name': cat.title(), 'raw_name': cat, 'count': count, 'level': 1})
        cat_data.sort(key=lambda x: x['count'], reverse=True)
        titles = {'fr': "CATÉGORIES DISPONIBLES", 'en': "AVAILABLE CATEGORIES", 'ar': "الفئات المتاحة"}
        response = f"** {titles.get(language, titles['fr'])}** ({len(cat_data)} catégories)\n\nCliquez sur une catégorie pour voir ses produits 👇"
        return {'response': response, 'products': [], 'action': 'list_categories', 'categories': cat_data}

    def _list_all_products(self, language='fr'):
        products = self.data_loader.get_all_products()
        total = len(products)
        titles = {'fr': "CATALOGUE COMPLET", 'en': "COMPLETE CATALOG", 'ar': "الكتالوج الكامل"}
        response = f'** {titles.get(language, titles["fr"])}** — {total} produits'
        if total > 15:
            hints = {'fr': "\n\n💡 *J'affiche les 15 premiers produits. Pour voir plus, précisez votre recherche.*", 'en': "\n\n💡 *Showing first 15 products. For more, refine your search.*", 'ar': "\n\n💡 *عرض أول 15 منتجاً. للمزيد، حدد بحثك.*"}
            response += hints.get(language, hints['fr'])
            displayed_products = products[:15]
        else:
            displayed_products = products[:20]
        return {'response': response, 'products': displayed_products, 'action': 'show_products'}

    # ========== GESTIONNAIRES DE REQUÊTES ==========

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
            products = [p for p in all_products if category_name.lower() in p.category.lower() or category_name.lower() in p.mainCategory.lower()]
        if products:
            if session:
                session['context']['current_category'] = category_name
                session['context']['last_products'] = products
            response = f"** {category_name.upper()}** — {len(products)} produit(s)\n\n💡 **Astuce** : Dites *compare ces produits* ou *meilleur produit* pour analyser cette liste."
            return {'response': response, 'products': products[:15], 'action': 'show_products', 'category': category_name}
        return None

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
            return {'response': "Aucun produit trouvé avec ce budget.", 'products': [], 'action': 'chat'}
        best = self._score_and_recommend(candidate_pool)
        response = "**RECOMMANDATION PERSONNALISÉE**\n\n"
        if price_constraint:
            response += f"💰 **Budget** : jusqu'à {price_constraint.get('max', '?')}€\n\n"
        response += f"🏆 **Meilleur choix : {best[0].name}**\n💰 Prix : {best[0].price}€\n📦 Stock : {best[0].stock} unités\n⭐ Note : {best[0].rating}/5\n🛒 Commandes : {best[0].order_count}\n"
        if best[0].features:
            response += f"✅ {best[0].features[0]}\n"
        if len(best) > 1:
            response += "\n**Autres bonnes options :**\n"
            for p in best[1:4]:
                response += f"• **{p.name}** — {p.price}€ | ⭐{p.rating} | 📦{p.stock}\n"
        response += "\n💬 Dites *compare* pour analyser ces produits en détail."
        return {'response': response, 'products': best[:5], 'action': 'show_products'}

    def _handle_price_query(self, message, msg_lower, language='fr'):
        constraint = self._extract_price_constraint(msg_lower)
        all_products = self.data_loader.get_all_products()
        if constraint:
            filtered = all_products
            if 'max' in constraint:
                filtered = [p for p in filtered if p.price <= constraint['max']]
            if 'min' in constraint:
                filtered = [p for p in filtered if p.price >= constraint['min']]
            if not filtered:
                return {'response': self._get_response('no_products', language), 'products': [], 'action': 'chat'}
            filtered_sorted = sorted(filtered, key=lambda x: x.price)
            labels = {'fr': f"moins de {constraint['max']}€", 'en': f"under {constraint['max']}€", 'ar': f"أقل من {constraint['max']}€"}
            label = labels.get(language, labels['fr']) if 'max' in constraint else "dans votre budget"
            response = f"**PRODUITS {label.upper()}** — {len(filtered_sorted)} trouvés\n\n"
            for p in filtered_sorted[:10]:
                stock = "✅" if p.stock > 0 else "❌"
                response += f"{stock} **{p.name}** — **{p.price}€** | {p.category}\n"
            return {'response': response, 'products': filtered_sorted[:10], 'action': 'show_products'}
        products = sorted(all_products, key=lambda x: x.price)[:8]
        titles = {'fr': "PRODUITS LES MOINS CHERS", 'en': "CHEAPEST PRODUCTS", 'ar': "أرخص المنتجات"}
        response = f"** {titles.get(language, titles['fr'])}**\n\n"
        for p in products[:8]:
            stock = "✅" if p.stock > 0 else "❌"
            response += f"{stock} **{p.name}** — **{p.price}€** | {p.category}\n"
        return {'response': response, 'products': products[:8], 'action': 'show_products'}

    def _handle_stock_query(self, msg_lower, language='fr'):
        all_products = self.data_loader.get_all_products()
        if any(w in msg_lower for w in ['rupture', 'épuisé', 'out of stock', 'pas disponible']):
            products = [p for p in all_products if p.stock == 0]
            labels = {'fr': "EN RUPTURE DE STOCK", 'en': "OUT OF STOCK", 'ar': "غير متوفر"}
            label = labels.get(language, labels['fr'])
        else:
            products = sorted([p for p in all_products if p.stock > 0], key=lambda x: x.stock, reverse=True)
            labels = {'fr': "DISPONIBLES EN STOCK", 'en': "IN STOCK", 'ar': "متوفر"}
            label = labels.get(language, labels['fr'])
        response = f"** PRODUITS {label}** — {len(products)} produits\n\n"
        for p in products[:10]:
            response += f"✅ **{p.name}** — {p.stock} unités | {p.price}€\n"
        return {'response': response, 'products': products[:10], 'action': 'show_products'}

    def _handle_order_query(self, msg_lower, language='fr'):
        products = sorted(self.data_loader.get_all_products(), key=lambda x: x.order_count, reverse=True)
        titles = {'fr': "PRODUITS LES PLUS COMMANDÉS", 'en': "BEST SELLERS", 'ar': "الأكثر مبيعاً"}
        response = f"** {titles.get(language, titles['fr'])}**\n\n"
        for i, p in enumerate(products[:10], 1):
            response += f"**#{i}** {p.name} — {p.order_count} commandes | {p.price}€\n"
        return {'response': response, 'products': products[:10], 'action': 'show_products'}

    def _handle_feature_spec_query(self, message, msg_lower):
        products = self.search_engine.search(message, limit=10)
        if not products:
            products = self._search_in_features_specs(msg_lower)
        if products:
            response = f"** PRODUITS CORRESPONDANTS** — {len(products)} résultats\n\n"
            for p in products:
                matching = self._find_matching_feature(p, msg_lower)
                response += f"• **{p.name}** ({p.price}€)"
                if matching:
                    response += f" — *{matching}*"
                response += "\n"
        else:
            response = "Aucun produit trouvé avec cette caractéristique. Essayez d'autres mots-clés."
        return {'response': response, 'products': products, 'action': 'show_products'}

    def _handle_free_search(self, message, msg_lower, context, history, language='fr'):
        products = self.search_engine.search(message, limit=8)
        if not products:
            keywords = self.text_processor.extract_keywords(message)
            for kw in keywords:
                if len(kw) > 3:
                    products = self.search_engine.search(kw, limit=5)
                    if products:
                        break
        if products:
            context['last_products'] = products[:5]
            if len(products) == 1:
                p = products[0]
                response = f"**{p.name}**\n\n💰 Prix : **{p.price}€**\n📦 Stock : {p.stock} unités\n🏷️ Catégorie : {p.category}\n⭐ Note : {p.rating}/5\n🛒 Commandes : {p.order_count}\n"
                if p.features:
                    response += "\n**Caractéristiques :**\n" + "\n".join(f"• {f}" for f in p.features[:5])
            else:
                titles = {'fr': "RÉSULTATS", 'en': "RESULTS", 'ar': "النتائج"}
                response = f"** {titles.get(language, titles['fr'])}** — {len(products)} produits trouvés\n\n"
                for i, p in enumerate(products, 1):
                    stock = "✅" if p.stock > 0 else "❌"
                    response += f"{stock} **{i}. {p.name}** — {p.price}€ | {p.category}\n"
                tips = {'fr': f"\n💡 Dites *compare ces produits* pour les comparer.", 'en': f"\n💡 Say *compare these products* to compare them.", 'ar': f"\n💡 قل *قارن هذه المنتجات* للمقارنة بينها."}
                response += tips.get(language, tips['fr'])
            return {'response': response, 'products': products, 'action': 'show_products'}
        return {'response': self._get_response('not_found', language, query=message), 'products': [], 'action': 'chat'}

    def _handle_comparison_with_intent(self, intent_type, products, criteria, context, history, language='fr'):
        if intent_type == 'criteria_without_products':
            messages = {
                'fr': "Je ne vois pas quels produits comparer.\n\nPour comparer selon ce critère, vous pouvez :\n• Chercher d'abord des produits : *affiche les tours CNC*\n• Comparer tout le catalogue : *comparer tous selon le prix*",
                'en': "I don't see which products to compare.\n\nTo compare by this criteria, you can:\n• First search for products: *show CNC lathes*\n• Compare the entire catalog: *compare all by price*",
                'ar': "لا أرى أي منتجات للمقارنة.\n\nللمقارنة حسب هذا المعيار، يمكنك:\n• البحث عن المنتجات أولاً: *أظهر مخارط CNC*\n• مقارنة الكتالوج بأكمله: *قارن الكل حسب السعر*"
            }
            return {'response': messages.get(language, messages['fr']), 'products': [], 'action': 'chat'}
        if intent_type == 'compare_all_catalog':
            return self._compare_all_products_in_catalog()
        return self._standard_comparison(products)

    # ========== MÉTHODES DE COMPARAISON ==========

    def _compare_all_products_in_catalog(self):
        all_products = self.data_loader.get_all_products()
        if not all_products:
            return {'response': "Aucun produit dans le catalogue.", 'products': [], 'action': 'chat'}
        total = len(all_products)
        categories = set(p.category for p in all_products)
        response = f"**COMPARAISON GLOBALE DU CATALOGUE**\n{total} produits répartis dans {len(categories)} catégories\n\n"
        response += "─" * 40 + "\n\n"
        prices = [p.price for p in all_products]
        avg_price = sum(prices) / len(prices)
        response += f"**STATISTIQUES GÉNÉRALES**\n• Prix moyen : **{avg_price:.0f}€**\n• Prix min : **{min(prices):.0f}€**\n• Prix max : **{max(prices):.0f}€**\n• Stock total : **{sum(p.stock for p in all_products)}**\n\n"
        return {'response': response, 'products': all_products[:10], 'action': 'show_global_comparison', 'comparison_type': 'global'}

    def _standard_comparison(self, products):
        comparison = self.comparator.compare(products)
        response = self._format_comparison(comparison, None)
        return {'response': response, 'products': products, 'action': 'show_comparison', 'comparison': {k: v for k, v in comparison.items() if k != 'products'}, 'comparison_type': 'standard'}

    # ========== UTILITAIRES ==========

    def _score_and_recommend(self, products):
        return ScoringService.score_products(products)

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
        if not comparison:
            return "Impossible d'effectuer la comparaison."
        products = comparison.get('products', [])
        if len(products) == 2:
            response = f"**Comparaison entre {products[0]['name']} et {products[1]['name']}**\n\n"
        else:
            names = [p.get('name', '?') for p in products]
            if len(names) > 2:
                response = f"**Comparaison entre {', '.join(names[:-1])} et {names[-1]}**\n\n"
            else:
                response = f"**Comparaison**\n\n"
        response += "─" * 40 + "\n\n**En résumé :**\n"
        for item in comparison.get('summary', []):
            stock_icon = "✅" if item.get('stock', 0) > 0 else "❌"
            response += f"• **{item['name']}** : {item['price']}€, ⭐{item['rating']}, {stock_icon} {item['stock']} en stock\n"
        if comparison.get('recommendation'):
            rec = comparison['recommendation']
            response += f"\n🏆 **Mon conseil** : {rec['best_product']}\n💡 {rec['explanation']}\n"
        return response