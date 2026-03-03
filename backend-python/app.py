from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
from dotenv import load_dotenv

from services.mongo_service import MongoService
from services.training_service import TrainingService
from chatbot.intent_recognizer import IntentRecognizer
from chatbot.product_search import ProductSearch
from chatbot.recommendation import RecommendationEngine
from chatbot.conversation import ConversationManager
from comparateur.product_comparator import ProductComparator
from utils.text_processor import TextProcessor
from models.mongo_product import MongoProduct

load_dotenv()
# Ajoutez cette fonction vers le début du fichier, après les imports

def get_guide_message(language="fr"):
    """Retourne le guide d'utilisation complet du chatbot"""
    
    if language == "fr":
        guide = "**🤖 GUIDE D'UTILISATION DU CHATBOT**\n\n"
        guide += "**📋 CATÉGORIES**\n"
        guide += "• 'liste' ou 'catégories' - Voir toutes les catégories\n"
        guide += "• 'aide achat' - Guide d'achat personnalisé\n\n"
        
        guide += "**🔍 RECHERCHE**\n"
        guide += "• 'cherche [mot]' - Rechercher un produit\n"
        guide += "• 'prix [produit]' - Voir le prix d'un produit\n\n"
        
        guide += "**⚖️ COMPARAISON**\n"
        guide += "• 'compare X et Y' - Comparer deux produits\n"
        guide += "• 'comparer tous' - Comparer tous les produits\n"
        guide += "• 'meilleur produit' - Meilleur produit global\n\n"
        
        guide += "**🏆 RECOMMANDATIONS**\n"
        guide += "• 'meilleur rapport qualité/prix' - Les moins chers\n"
        guide += "• 'haut de gamme' - Les plus prestigieux\n"
        guide += "• 'en stock' - Produits disponibles\n"
        guide += "• 'populaire' - Les plus demandés\n\n"
        
        guide += "**📦 CATÉGORIES SPÉCIFIQUES**\n"
        guide += "• 'CNC' - Machines CNC\n"
        guide += "• 'Voiture' - Systèmes automobiles\n"
        guide += "• 'MCP' - Équipements lab\n\n"
        
        guide += "👉 **Cliquez directement sur les boutons pour naviguer !**"
        
    elif language == "en":
        guide = "**🤖 CHATBOT USER GUIDE**\n\n"
        guide += "**📋 CATEGORIES**\n"
        guide += "• 'list' or 'categories' - View all categories\n"
        guide += "• 'buy help' - Personalized buying guide\n\n"
        
        guide += "**🔍 SEARCH**\n"
        guide += "• 'search [word]' - Search for a product\n"
        guide += "• 'price [product]' - View product price\n\n"
        
        guide += "**⚖️ COMPARISON**\n"
        guide += "• 'compare X and Y' - Compare two products\n"
        guide += "• 'compare all' - Compare all products\n"
        guide += "• 'best product' - Best overall product\n\n"
        
        guide += "**🏆 RECOMMENDATIONS**\n"
        guide += "• 'best value' - Cheapest products\n"
        guide += "• 'premium' - Most prestigious\n"
        guide += "• 'in stock' - Available products\n"
        guide += "• 'popular' - Most demanded\n\n"
        
        guide += "**📦 SPECIFIC CATEGORIES**\n"
        guide += "• 'CNC' - CNC Machines\n"
        guide += "• 'Car' - Automotive systems\n"
        guide += "• 'MCP' - Lab equipment\n\n"
        
        guide += "👉 **Click on buttons to navigate!**"
    
    elif language == "ar":
        guide = "**🤖 دليل استخدام المساعد**\n\n"
        guide += "**📋 الفئات**\n"
        guide += "• 'قائمة' أو 'فئات' - عرض جميع الفئات\n"
        guide += "• 'مساعدة شراء' - دليل شراء مخصص\n\n"
        
        guide += "**🔍 بحث**\n"
        guide += "• 'ابحث [كلمة]' - البحث عن منتج\n"
        guide += "• 'سعر [منتج]' - عرض سعر المنتج\n\n"
        
        guide += "**⚖️ مقارنة**\n"
        guide += "• 'قارن X و Y' - مقارنة منتجين\n"
        guide += "• 'قارن الكل' - مقارنة جميع المنتجات\n"
        guide += "• 'أفضل منتج' - أفضل منتج بشكل عام\n\n"
        
        guide += "**🏆 توصيات**\n"
        guide += "• 'أفضل قيمة' - أرخص المنتجات\n"
        guide += "• 'فاخر' - الأكثر تميزًا\n"
        guide += "• 'متوفر' - المنتجات المتاحة\n"
        guide += "• 'شائع' - الأكثر طلبًا\n\n"
        
        guide += "**📦 فئات محددة**\n"
        guide += "• 'CNC' - ماكينات التحكم الرقمي\n"
        guide += "• 'سيارة' - أنظمة السيارات\n"
        guide += "• 'MCP' - معدات المختبرات\n\n"
        
        guide += "👉 **انقر على الأزرار للتنقل!**"
    
    return guide
app = Flask(__name__)
CORS(app)

# Initialisation MongoDB
mongo_service = MongoService()

# Adapter les services pour MongoDB
class MongoProductSearch:
    def __init__(self, mongo_service):
        self.mongo_service = mongo_service
        
    def search_by_keywords(self, keywords, limit=10):
        if not keywords:
            return []
        
        query = ' '.join(keywords)
        products_data = self.mongo_service.search_products(query, limit)
        return [MongoProduct(p) for p in products_data]
    
    def search_by_keywords_advanced(self, keywords, limit=10):
        """Recherche avancée avec score de pertinence"""
        if not keywords:
            return []
        
        # Importer le processeur de texte
        from utils.text_processor import TextProcessor
        text_processor = TextProcessor()
        
        all_products_data = self.mongo_service.get_all_products()
        all_products = [MongoProduct(p) for p in all_products_data]
        
        results = []
        for product in all_products:
            score = 0
            search_text = product.get_searchable_text()  # Déjà normalisé
            
            for keyword in keywords:
                normalized_keyword = text_processor.normalize_text(keyword)
                
                if normalized_keyword in search_text:
                    score += 1
                if normalized_keyword in text_processor.normalize_text(product.name):
                    score += 2  # Bonus pour le nom
                if normalized_keyword in text_processor.normalize_text(product.category_name):
                    score += 1.5  # Bonus pour la catégorie
            
            if score > 0:
                results.append((score, product))
        
        # Trier par score décroissant
        results.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in results][:limit]

class MongoRecommendationEngine:
    def __init__(self, mongo_service):
        self.mongo_service = mongo_service
        
    def recommend_by_criteria(self, criteria, limit=5):
        # Implémenter la logique de recommandation
        all_products_data = self.mongo_service.get_all_products()
        all_products = [MongoProduct(p) for p in all_products_data]
        
        if criteria.get('max_price'):
            all_products = [p for p in all_products if p.price <= criteria['max_price']]
        
        if criteria.get('category'):
            all_products = [p for p in all_products if criteria['category'].lower() in p.category_name.lower()]
        
        return all_products[:limit]
    
    def get_trending_products(self, limit=5):
        products_data = self.mongo_service.get_all_products()
        # Trier par featured ou stock
        products = [MongoProduct(p) for p in products_data]
        products.sort(key=lambda x: (x.isFeatured, x.stock), reverse=True)
        return products[:limit]
    
    def get_best_value_products(self, limit=5):
        """Meilleur rapport qualité/prix (prix les plus bas)"""
        products_data = self.mongo_service.get_all_products()
        products = [MongoProduct(p) for p in products_data]
        products.sort(key=lambda x: x.price)
        return products[:limit]
    
    def get_premium_products(self, limit=5):
        """Produits haut de gamme (prix les plus élevés)"""
        products_data = self.mongo_service.get_all_products()
        products = [MongoProduct(p) for p in products_data]
        products.sort(key=lambda x: x.price, reverse=True)
        return products[:limit]
    
    def get_available_products(self, limit=5):
        """Produits en stock"""
        products_data = self.mongo_service.get_all_products()
        products = [MongoProduct(p) for p in products_data if p.stock > 0]
        return products[:limit]
    
    def get_best_product_overall(self, all_products):
        """Trouve le meilleur produit globalement (comparaison générale)"""
        if not all_products:
            return None
        
        best_product = None
        best_score = -1
        
        for product in all_products:
            score = 0
            # Critères de notation
            if product.stock > 0:
                score += 10  # Bonus pour disponibilité
            if product.isFeatured:
                score += 5   # Bonus pour produit en vedette
            # Plus le prix est bas, meilleur est le score (pour le rapport qualité/prix)
            price_score = max(0, 100 - (product.price / 100))  # Score basé sur le prix
            score += price_score
            
            if score > best_score:
                best_score = score
                best_product = product
        
        return best_product

class MongoProductComparator:
    def __init__(self, mongo_service):
        self.mongo_service = mongo_service
    
    def compare_products(self, product1, product2):
        """Compare deux produits et retourne une analyse détaillée"""
        if not product1 or not product2:
            return None
        
        comparison = {
            'product1': product1.to_dict(),
            'product2': product2.to_dict(),
            'price_difference': abs(product1.price - product2.price),
            'cheaper': product1.name if product1.price < product2.price else product2.name,
            'advantages': []
        }
        
        # Analyser les avantages
        if product1.price < product2.price:
            comparison['advantages'].append(f"{product1.name} est {comparison['price_difference']}€ moins cher")
        else:
            comparison['advantages'].append(f"{product2.name} est {comparison['price_difference']}€ moins cher")
        
        if product1.stock > product2.stock:
            comparison['advantages'].append(f"{product1.name} a plus de stock ({product1.stock} vs {product2.stock})")
        elif product2.stock > product1.stock:
            comparison['advantages'].append(f"{product2.name} a plus de stock ({product2.stock} vs {product1.stock})")
        
        # Comparer les features (nombre)
        if product1.features and product2.features:
            if len(product1.features) > len(product2.features):
                comparison['advantages'].append(f"{product1.name} a plus de fonctionnalités ({len(product1.features)} vs {len(product2.features)})")
            elif len(product2.features) > len(product1.features):
                comparison['advantages'].append(f"{product2.name} a plus de fonctionnalités ({len(product2.features)} vs {len(product1.features)})")
        
        return comparison
    
    def find_best_product(self, products):
        """Trouve le meilleur produit parmi une liste"""
        if not products:
            return None
        
        best = None
        best_score = -1
        
        for product in products:
            score = 0
            if product.stock > 0:
                score += 10
            # Plus le prix est bas, meilleur est le score
            score += max(0, 100 - (product.price / 10))
            if product.isFeatured:
                score += 5
            if product.features:
                score += len(product.features)
            
            if score > best_score:
                best_score = score
                best = product
        
        return best

# Initialiser les services avec MongoDB
product_search = MongoProductSearch(mongo_service)
recommendation_engine = MongoRecommendationEngine(mongo_service)
conversation_manager = ConversationManager()
intent_recognizer = IntentRecognizer()
comparator = MongoProductComparator(mongo_service)
text_processor = TextProcessor()
training_service = TrainingService(None)  # Plus nécessaire avec MongoDB

print("✅ Connexion MongoDB établie")

def comparer_produits(produit1, produit2):
    """Fonction de comparaison détaillée"""
    
    response = f"**🔍 COMPARAISON DÉTAILLÉE**\n\n"
    response += f"**{produit1.name}** vs **{produit2.name}**\n"
    response += "=" * 50 + "\n\n"
    
    # 1. PRIX
    response += f"💰 **PRIX**\n"
    response += f"• {produit1.name}: **{produit1.price} €**\n"
    response += f"• {produit2.name}: **{produit2.price} €**\n"
    
    diff_prix = abs(produit1.price - produit2.price)
    if produit1.price < produit2.price:
        response += f"✅ **{produit1.name} est {diff_prix} € moins cher**\n\n"
    elif produit2.price < produit1.price:
        response += f"✅ **{produit2.name} est {diff_prix} € moins cher**\n\n"
    else:
        response += f"➡️ **Prix identiques**\n\n"
    
    # 2. CATÉGORIES
    response += f"🔧 **CATÉGORIES**\n"
    response += f"• {produit1.name}: {produit1.category_name}\n"
    response += f"• {produit2.name}: {produit2.category_name}\n\n"
    
    # 3. CARACTÉRISTIQUES PRINCIPALES
    if produit1.features and produit2.features:
        response += f"📋 **CARACTÉRISTIQUES**\n"
        response += f"• {produit1.name}: {len(produit1.features)} fonctionnalités\n"
        response += f"• {produit2.name}: {len(produit2.features)} fonctionnalités\n"
        if produit1.features:
            response += f"  Ex: {produit1.features[0][:50]}...\n"
        if produit2.features:
            response += f"  Ex: {produit2.features[0][:50]}...\n"
        response += "\n"
    
    # 4. DISPONIBILITÉ
    response += f"📦 **DISPONIBILITÉ**\n"
    response += f"• {produit1.name}: {produit1.stock} en stock\n"
    response += f"• {produit2.name}: {produit2.stock} en stock\n\n"
    
    # 5. RECOMMANDATION
    response += f"🏆 **RECOMMANDATION**\n"
    
    # Calculer un score pour chaque produit
    score1 = 0
    score2 = 0
    
    if produit1.price < produit2.price:
        score1 += 1
    else:
        score2 += 1
    
    if produit1.stock > produit2.stock:
        score1 += 1
    elif produit2.stock > produit1.stock:
        score2 += 1
    
    if produit1.features and produit2.features:
        if len(produit1.features) > len(produit2.features):
            score1 += 1
        elif len(produit2.features) > len(produit1.features):
            score2 += 1
    
    if score1 > score2:
        response += f"✅ **{produit1.name}** est légèrement meilleur selon nos critères."
    elif score2 > score1:
        response += f"✅ **{produit2.name}** est légèrement meilleur selon nos critères."
    else:
        if produit1.price < produit2.price:
            response += f"✅ **{produit1.name}** offre un meilleur rapport qualité/prix."
        elif produit2.price < produit1.price:
            response += f"✅ **{produit2.name}** offre un meilleur rapport qualité/prix."
        else:
            response += f"🤝 Les deux produits sont très similaires, le choix dépend de vos besoins."
    
    return response

def comparer_tous_les_produits(all_products):
    """Compare tous les produits et trouve le meilleur"""
    if not all_products:
        return None, "Aucun produit à comparer."
    
    best_product = comparator.find_best_product(all_products)
    
    if best_product:
        response = f"**🏆 MEILLEUR PRODUIT GLOBAL**\n\n"
        response += f"Après analyse de tous nos produits, **{best_product.name}** est le meilleur choix !\n\n"
        response += f"💰 Prix: {best_product.price} €\n"
        response += f"📦 Stock: {best_product.stock} unités\n"
        if best_product.features:
            response += f"📋 {len(best_product.features)} fonctionnalités\n"
        if best_product.isFeatured:
            response += f"⭐ Produit en vedette\n"
        
        return best_product, response
    
    return None, "Impossible de déterminer le meilleur produit."

def recommander_produits(critere, all_products):
    """Fonction de recommandation selon différents critères"""
    
    if critere == "meilleur_prix":
        products = sorted(all_products, key=lambda x: x.price)[:5]
        return "🏆 **Meilleurs prix** :\nVoici nos produits les plus abordables :", products
    
    elif critere == "haut_gamme":
        products = sorted(all_products, key=lambda x: x.price, reverse=True)[:5]
        return "💎 **Produits haut de gamme** :\nVoici nos produits les plus prestigieux :", products
    
    elif critere == "stock":
        products = [p for p in all_products if p.stock > 0][:8]
        return "📦 **Produits en stock** :\nVoici les produits disponibles immédiatement :", products
    
    elif critere == "populaire":
        products = [p for p in all_products if p.isFeatured][:6]
        if not products:
            products = all_products[:6]
        return "🌟 **Produits populaires** :\nVoici nos produits les plus demandés :", products
    
    elif critere == "qualite_prix":
        products = sorted(all_products, key=lambda x: x.price)[:5]
        return "⚖️ **Meilleur rapport qualité/prix** :\nVoici une sélection équilibrée :", products
    
    else:
        return None, []

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        user_id = data.get('user_id', 'default')
        
        print(f"📩 Message reçu: {message}")
        
        # Ajouter au contexte
        conversation_manager.add_message(user_id, 'user', message)
        
        # Récupérer la session
        session = conversation_manager.get_or_create_session(user_id)
        
        # Reconnaître l'intention
        intent = intent_recognizer.recognize(message)
        entities = intent_recognizer.extract_entities(message)
        
        response = ""
        products = []
        categories_to_show = []
        parent_category = None
        
        message_lower = message.lower().strip()
        
        # Récupérer tous les produits une fois pour les recommandations
        all_products_data = mongo_service.get_all_products()
        all_products = [MongoProduct(p) for p in all_products_data]
        
        # ============================================
        # VÉRIFIER SI LE MESSAGE CORRESPOND À UNE CATÉGORIE
        # ============================================
        category = mongo_service.get_category_by_name(message)
        
        if category:
            print(f"✅ Catégorie reconnue: {category['name']}")
            
            # Récupérer les sous-catégories
            subcategories = mongo_service.get_subcategories(category['_id'])
            
            # Récupérer les produits de cette catégorie
            products_data = mongo_service.get_products_by_category(category['name'])
            products = [MongoProduct(p) for p in products_data][:8]
            
            # Formater les sous-catégories pour les boutons
            for sub in subcategories:
                sub['count'] = mongo_service.count_products_in_category(sub['_id'])
                sub['level'] = 2
            
            if subcategories:
                response = f"**{category['name']}** contient {len(subcategories)} sous-catégories :"
                categories_to_show = subcategories
                parent_category = {'name': category['name'], 'id': category['_id']}
            elif products:
                response = f"Voici les produits de la catégorie **{category['name']}** ({len(products)} produits) :"
            else:
                response = f"La catégorie **{category['name']}** ne contient aucun produit pour le moment."
        
        # ============================================
        # GESTION DES SALUTATIONS
        # ============================================
        elif intent == 'greeting':
            response = "Bonjour ! 👋 Je suis votre assistant UniverTechno+. Comment puis-je vous aider aujourd'hui ?"
        
        # ============================================
        # DEMANDE D'AIDE POUR ACHETER
        # ============================================
        elif ('aide' in message_lower and 'acheter' in message_lower) or 'aide achat' in message_lower:
            # Récupérer les catégories principales
            categories = mongo_service.get_categories_hierarchy()
            response = "Bien sûr ! Je peux vous aider à choisir un produit. Voici nos catégories principales :\n\n"
            
            categories_to_show = []
            for cat in categories:
                cat['count'] = mongo_service.count_products_in_category(cat['_id'])
                cat['level'] = 1
                categories_to_show.append(cat)
                response += f"• **{cat['name']}** ({cat['count']} produits)\n"
                if 'subcategories' in cat and cat['subcategories']:
                    for sub in cat['subcategories'][:2]:
                        response += f"  - {sub['name']}\n"
            
            response += "\n👉 **Cliquez sur une catégorie pour voir ses sous-catégories !**"
        
        # ============================================
        # COMPARAISON DE PRODUITS (CAS 1: Deux produits spécifiques)
        # ============================================
        elif 'compar' in message_lower or ' vs ' in message_lower or ' versus ' in message_lower:
            
            patterns = [
                r'compare\s+([^\s]+(?:\s+[^\s]+)*?)\s+(?:et|vs|versus)\s+([^\s]+(?:\s+[^\s]+)*)',
                r'comparer\s+([^\s]+(?:\s+[^\s]+)*?)\s+(?:et|vs|versus)\s+([^\s]+(?:\s+[^\s]+)*)',
                r'([^\s]+(?:\s+[^\s]+)*?)\s+(?:et|vs|versus)\s+([^\s]+(?:\s+[^\s]+)*)',
                r'différence\s+(?:entre\s+)?([^\s]+(?:\s+[^\s]+)*?)\s+(?:et|vs|versus)\s+([^\s]+(?:\s+[^\s]+)*)'
            ]
            
            product1_name = None
            product2_name = None
            
            for pattern in patterns:
                match = re.search(pattern, message_lower)
                if match:
                    product1_name = match.group(1).strip()
                    product2_name = match.group(2).strip()
                    break
            
            if product1_name and product2_name:
                product1 = None
                product2 = None
                
                for p in all_products:
                    if product1_name in p.name.lower():
                        product1 = p
                    if product2_name in p.name.lower():
                        product2 = p
                
                if product1 and product2:
                    response = comparer_produits(product1, product2)
                    products = [product1, product2]
                    
                    # Ajouter une question pour le meilleur
                    session['context']['last_comparison'] = {
                        'product1': product1.name,
                        'product2': product2.name
                    }
                    
                else:
                    response = "Je n'ai pas trouvé ces produits. Voici quelques produits disponibles :\n"
                    for i, p in enumerate(all_products[:8], 1):
                        response += f"{i}. {p.name}\n"
                    response += "\n👉 Essayez avec des noms exacts comme 'De2-Ultra' ou 'PC1 Baby'"
            else:
                response = "Pour comparer des produits, dites par exemple :\n• **'compare De2-Ultra et PC1 Baby'**\n• **'De2-Ultra vs PC1 Baby'**\n• **'différence entre Fa2-Ultra et PX1 Baby'**"
        
        # ============================================
        # QUESTION SUR LE MEILLEUR PRODUIT APRÈS COMPARAISON (CAS 1 suite)
        # ============================================
        elif any(word in message_lower for word in ['meilleur', 'best', 'lequel', 'which']) and 'compar' in str(session.get('context', {}).get('last_intent', '')):
            
            last_comparison = session.get('context', {}).get('last_comparison')
            if last_comparison:
                product1 = None
                product2 = None
                
                for p in all_products:
                    if last_comparison['product1'] in p.name:
                        product1 = p
                    if last_comparison['product2'] in p.name:
                        product2 = p
                
                if product1 and product2:
                    # Refaire la comparaison avec recommandation renforcée
                    response = comparer_produits(product1, product2)
                    products = [product1, product2]
                else:
                    response = "Je ne retrouve pas les produits de la comparaison précédente."
            else:
                response = "Pour quelle comparaison voulez-vous connaître le meilleur produit ?"
        
        # ============================================
        # COMPARAISON GLOBALE (CAS 2: Tous les produits)
        # ============================================
        elif any(word in message_lower for word in ['comparer tous', 'compare all', 'tous les produits', 'all products']):
            
            best_product, comp_response = comparer_tous_les_produits(all_products)
            response = comp_response
            if best_product:
                products = [best_product]
        
        # ============================================
        # MEILLEUR PRODUIT GLOBAL (CAS 2 suite)
        # ============================================
        elif any(word in message_lower for word in ['meilleur produit global', 'best overall', 'meilleur tous']):
            
            best_product, comp_response = comparer_tous_les_produits(all_products)
            response = comp_response
            if best_product:
                products = [best_product]
        
        # ============================================
        # RECHERCHE AVANCÉE PAR MOTS-CLÉS
        # ============================================
        elif any(word in message_lower for word in ['cherche', 'recherche', 'trouve', 'find', 'keyword']):
            keywords = text_processor.extract_keywords(message)
            stop_words = ['cherche', 'recherche', 'trouve', 'find', 'keyword', 'produit', 'avoir', 'veux', 'want']
            keywords = [k for k in keywords if k not in stop_words]
            
            if keywords:
                # Utiliser la recherche avancée
                products = product_search.search_by_keywords_advanced(keywords, limit=8)
                if products:
                    response = f"🔍 J'ai trouvé {len(products)} produit(s) correspondant à votre recherche par mots-clés :\n\n"
                    for i, p in enumerate(products, 1):
                        response += f"{i}. **{p.name}** - {p.price} €\n"
                else:
                    response = "😕 Je n'ai pas trouvé de produit correspondant à ces mots-clés."
                    # Proposer des catégories
                    categories = mongo_service.get_categories_hierarchy()
                    categories_to_show = []
                    for cat in categories[:5]:
                        cat['count'] = mongo_service.count_products_in_category(cat['_id'])
                        cat['level'] = 1
                        categories_to_show.append(cat)
                    response += "\n\n📋 **Catégories disponibles :**"
            else:
                response = "❓ Que voulez-vous chercher ? (ex: 'cherche tour CNC', 'recherche capteurs', 'find milling machine')"
        
        # ============================================
        # RECHERCHE SIMPLE (existante)
        # ============================================
        elif any(word in message_lower for word in ['cherche', 'recherche', 'trouve', 'find']):
            keywords = text_processor.extract_keywords(message)
            stop_words = ['cherche', 'recherche', 'trouve', 'find', 'produit', 'avoir', 'veux', 'want']
            keywords = [k for k in keywords if k not in stop_words]
            
            if keywords:
                products = product_search.search_by_keywords(keywords, limit=8)
                if products:
                    response = f"🔍 J'ai trouvé {len(products)} produit(s) correspondant à votre recherche :"
                else:
                    response = "😕 Je n'ai pas trouvé de produit correspondant."
                    # Proposer des catégories
                    categories = mongo_service.get_categories_hierarchy()
                    categories_to_show = []
                    for cat in categories[:5]:
                        cat['count'] = mongo_service.count_products_in_category(cat['_id'])
                        cat['level'] = 1
                        categories_to_show.append(cat)
                    response += "\n\n📋 **Catégories disponibles :**"
            else:
                response = "❓ Que voulez-vous chercher ? (ex: 'cherche tour CNC', 'recherche capteurs', 'find milling machine')"
        
        # ============================================
        # CONSEILS / RECOMMANDATIONS
        # ============================================
        elif any(word in message_lower for word in ['conseil', 'conseille', 'recommande', 'suggère', 'advice', 'suggest']):
            
            response = "🤔 **Je peux vous conseiller selon différents critères :**\n\n"
            response += "• **'meilleur rapport qualité/prix'** - Les plus abordables\n"
            response += "• **'produits haut de gamme'** - Les plus prestigieux\n"
            response += "• **'produits en stock'** - Disponibles immédiatement\n"
            response += "• **'produits populaires'** - Les plus demandés\n"
            response += "• **'meilleurs prix'** - Les moins chers\n"
            response += "• **'comparer tous'** - Comparer tous les produits\n\n"
            response += "👉 Que préférez-vous ?"
        
        # ============================================
        # MEILLEUR PRODUIT / TOP / RECOMMANDATION
        # ============================================
        elif any(word in message_lower for word in ['meilleur', 'top', 'populaire', 'best', 'popular']):
            
            # 1. Meilleur rapport qualité/prix
            if any(word in message_lower for word in ['qualité', 'prix', 'rapport', 'value', 'price']):
                products = recommendation_engine.get_best_value_products(6)
                response = "🏆 **Meilleur rapport qualité/prix** :\nVoici les produits les plus abordables :"
            
            # 2. Haut de gamme / premium
            elif any(word in message_lower for word in ['haut de gamme', 'premium', 'cher', 'luxe', 'expensive']):
                products = recommendation_engine.get_premium_products(6)
                response = "💎 **Produits haut de gamme** :\nVoici nos produits les plus prestigieux :"
            
            # 3. Produits en stock
            elif any(word in message_lower for word in ['stock', 'disponible', 'available']):
                products = recommendation_engine.get_available_products(8)
                response = "📦 **Produits disponibles immédiatement** :"
            
            # 4. Par catégorie spécifique
            elif 'cnc' in message_lower:
                cnc_products = [p for p in all_products if 'cnc' in p.category_name.lower() or 'cnc' in p.name.lower()]
                cnc_products.sort(key=lambda x: x.price)
                products = cnc_products[:6]
                response = "🔧 **Meilleurs produits CNC** :\nVoici une sélection :"
            
            elif 'voiture' in message_lower or 'auto' in message_lower:
                voiture_products = [p for p in all_products if 'voiture' in p.mainCategory.lower() or 'capteur' in p.name.lower()]
                voiture_products.sort(key=lambda x: x.price)
                products = voiture_products[:6]
                response = "🚗 **Meilleurs produits automobile** :\nVoici une sélection :"
            
            elif 'mcp' in message_lower or 'lab' in message_lower:
                mcp_products = [p for p in all_products if 'mcp' in p.mainCategory.lower() or 'lab' in p.mainCategory.lower()]
                mcp_products.sort(key=lambda x: x.price)
                products = mcp_products[:6]
                response = "🔬 **Meilleurs équipements MCP lab** :\nVoici une sélection :"
            
            # 5. Par défaut : produits populaires / en vedette
            else:
                products = [p for p in all_products if p.isFeatured][:6]
                if not products:
                    products = all_products[:6]
                response = "🌟 **Nos produits populaires** :\nVoici nos produits les plus demandés :"
        
        # ============================================
        # PRODUITS EN STOCK
        # ============================================
        elif 'stock' in message_lower or 'disponible' in message_lower:
            products = recommendation_engine.get_available_products(8)
            if products:
                response = "📦 **Produits en stock** :\nVoici les produits disponibles immédiatement :"
            else:
                response = "😕 Désolé, aucun produit en stock pour le moment."
        
        # ============================================
        # PRODUITS LES MOINS CHERS
        # ============================================
        elif 'moins cher' in message_lower or 'abordable' in message_lower or 'petit prix' in message_lower:
            products = recommendation_engine.get_best_value_products(8)
            response = "💰 **Les moins chers** :\nVoici nos produits les plus abordables :"
        
        # ============================================
        # PRODUITS LES PLUS CHERS
        # ============================================
        elif 'plus cher' in message_lower or 'haut de gamme' in message_lower:
            products = recommendation_engine.get_premium_products(8)
            response = "💎 **Les plus prestigieux** :\nVoici nos produits haut de gamme :"
        
        # ============================================
        # LISTE DES CATÉGORIES - TOUS LES NIVEAUX
        # ============================================
        elif 'liste' in message_lower or 'catégorie' in message_lower or 'categorie' in message_lower or 'menu' in message_lower:
            categories = mongo_service.get_categories_hierarchy()
            
            # Formater la réponse texte
            response = "**📋 MENU COMPLET DES CATÉGORIES**\n\n"
            
            # Préparer la liste plate de toutes les catégories pour les boutons
            categories_to_show = []
            
            for cat in categories:
                # Compter les produits dans cette catégorie principale
                cat_count = mongo_service.count_products_in_category(cat['_id'])
                cat['count'] = cat_count
                cat['level'] = 1
                categories_to_show.append({
                    'id': cat['_id'],
                    'name': cat['name'],
                    'level': 1,
                    'count': cat_count,
                    'icon': cat.get('icon', '📁')
                })
                
                response += f"• **{cat['name']}** ({cat_count} produits)\n"
                
                if 'subcategories' in cat and cat['subcategories']:
                    for sub in cat['subcategories']:
                        # Compter les produits dans cette sous-catégorie
                        sub_count = mongo_service.count_products_in_category(sub['_id'])
                        sub['count'] = sub_count
                        categories_to_show.append({
                            'id': sub['_id'],
                            'name': sub['name'],
                            'level': 2,
                            'count': sub_count,
                            'parent': cat['name']
                        })
                        response += f"  - {sub['name']} ({sub_count} produits)\n"
                        
                        # Vérifier s'il y a des sous-sous-catégories (niveau 3)
                        if 'subcategories' in sub and sub['subcategories']:
                            for subsub in sub['subcategories']:
                                subsub_count = mongo_service.count_products_in_category(subsub['_id'])
                                categories_to_show.append({
                                    'id': subsub['_id'],
                                    'name': subsub['name'],
                                    'level': 3,
                                    'count': subsub_count,
                                    'parent': sub['name']
                                })
                                response += f"    • {subsub['name']} ({subsub_count} produits)\n"
            
            response += "\n👉 **Cliquez sur un bouton pour voir les produits ou sous-catégories !**"
        
        # ============================================
        # PRIX D'UN PRODUIT SPÉCIFIQUE
        # ============================================
        elif 'prix' in message_lower or 'tarif' in message_lower or 'combien' in message_lower or 'price' in message_lower:
            keywords = text_processor.extract_keywords(message)
            products = product_search.search_by_keywords(keywords, limit=3)
            if products:
                response = "💰 **Voici les prix des produits correspondants :**\n"
                for p in products:
                    response += f"• **{p.name}**: {p.price} €"
                    if p.stock > 0:
                        response += f" (✓ en stock)"
                    else:
                        response += f" (✗ rupture)"
                    response += "\n"
            else:
                response = "❓ Pour quel produit voulez-vous connaître le prix ? (ex: 'prix du De2-Ultra', 'combien coûte le PC1 Baby')"
        
        # ============================================
        # AIDE COMPLÈTE
        # ============================================
        elif 'aide' in message_lower or 'help' in message_lower:
            response = "**🤖 GUIDE D'UTILISATION DU CHATBOT**\n\n"
            response += "**📋 CATÉGORIES**\n"
            response += "• 'liste' ou 'catégories' - Voir toutes les catégories\n"
            response += "• 'aide achat' - Guide d'achat personnalisé\n\n"
            
            response += "**🔍 RECHERCHE**\n"
            response += "• 'cherche [mot]' - Rechercher un produit\n"
            response += "• 'prix [produit]' - Voir le prix d'un produit\n\n"
            
            response += "**⚖️ COMPARAISON**\n"
            response += "• 'compare X et Y' - Comparer deux produits\n"
            response += "• 'comparer tous' - Comparer tous les produits\n"
            response += "• 'meilleur produit' - Meilleur produit global\n\n"
            
            response += "**🏆 RECOMMANDATIONS**\n"
            response += "• 'meilleur rapport qualité/prix' - Les moins chers\n"
            response += "• 'haut de gamme' - Les plus prestigieux\n"
            response += "• 'en stock' - Produits disponibles\n"
            response += "• 'populaire' - Les plus demandés\n\n"
            
            response += "**📦 CATÉGORIES SPÉCIFIQUES**\n"
            response += "• 'CNC' - Machines CNC\n"
            response += "• 'Voiture' - Systèmes automobiles\n"
            response += "• 'MCP' - Équipements lab\n\n"
            
            response += "👉 **Cliquez directement sur les boutons pour naviguer !**"
        
        # ============================================
        # REMERCIEMENT
        # ============================================
        elif any(word in message_lower for word in ['merci', 'thanks', 'thank you']):
            response = "Je vous en prie ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider !"
        
        # ============================================
        # AU REVOIR
        # ============================================
        elif any(word in message_lower for word in ['au revoir', 'bye', 'à bientôt', 'goodbye']):
            response = "Au revoir ! 👋 Merci d'avoir utilisé notre assistant. À bientôt sur UniverTechno+ !"
        
        # ============================================
        # RÉPONSE PAR DÉFAUT
        # ============================================
        else:
            # Vérifier d'abord si c'est une catégorie (déjà fait au début)
            if not category:
                keywords = text_processor.extract_keywords(message)
                if keywords:
                    products = product_search.search_by_keywords(keywords, limit=4)
                
                if products:
                    response = f"🔍 Voici ce que j'ai trouvé pour '{message}' :"
                else:
                    response = "😕 Je n'ai pas compris. Tapez **'aide'** pour voir toutes les commandes disponibles."
        
        # Ajouter la réponse à la conversation
        conversation_manager.add_message(user_id, 'assistant', response, products)
        conversation_manager.update_context(user_id, last_intent=intent, last_query=message)
        
        # Préparer la réponse JSON
        response_data = {
            'success': True,
            'response': response,
            'products': [p.to_dict() for p in products] if products else [],
            'action': 'show_products' if products else 'chat'
        }
        
        # Ajouter les catégories si présentes
        if categories_to_show:
            response_data['categories'] = categories_to_show
            response_data['action'] = 'show_categories'
        
        if parent_category:
            response_data['parent_category'] = parent_category
        
        print(f"📤 Réponse: {response[:100]}...")
        print(f"📦 Produits: {len(products)}")
        print(f"📋 Catégories: {len(categories_to_show)}")
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False, 
            'error': str(e),
            'response': "Désolé, une erreur technique est survenue. Veuillez réessayer.",
            'products': []
        }), 500

# ============================================
# ROUTES DE DEBUG ET UTILITAIRES
# ============================================

@app.route('/api/categories/all', methods=['GET'])
def get_all_categories():
    """Récupère toutes les catégories avec leur hiérarchie"""
    try:
        categories = mongo_service.get_categories_hierarchy()
        return jsonify({
            'success': True,
            'categories': categories
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/debug/products', methods=['GET'])
def debug_products():
    products_data = mongo_service.get_all_products()
    products = [MongoProduct(p).to_dict() for p in products_data[:10]]
    return jsonify({
        'total': len(products_data),
        'sample': products
    })

@app.route('/api/debug/categories', methods=['GET'])
def debug_categories():
    categories = mongo_service.get_categories_hierarchy()
    return jsonify(categories)

@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Tester la connexion MongoDB
        mongo_service.client.admin.command('ping')
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    return jsonify({
        'status': 'healthy',
        'mongodb': db_status,
        'products': len(mongo_service.get_all_products()),
        'categories': len(mongo_service.get_all_categories())
    })

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"🚀 Serveur démarré sur http://localhost:{port}")
    print(f"📦 Connecté à MongoDB")
    app.run(debug=True, port=port)