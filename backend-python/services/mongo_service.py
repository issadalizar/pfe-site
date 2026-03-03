# services/mongo_service.py
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

class MongoService:
    def __init__(self):
        # Connexion à MongoDB
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        db_name = os.getenv('MONGODB_DB', 'pfe_db')
        
        print(f"🔌 Connexion à MongoDB: {mongo_uri}")
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        
        # Collections
        self.products = self.db['products']
        self.categories = self.db['categories']
        
        print(f"✅ Connecté à la base: {db_name}")
        
    def get_all_products(self):
        """Récupère tous les produits avec leurs catégories"""
        try:
            products = list(self.products.find({'isActive': True}))
            
            # Pour chaque produit, ajouter les infos de catégorie
            for product in products:
                product['_id'] = str(product['_id'])  # Convertir ObjectId en string
                if 'category' in product and product['category']:
                    category_id = product['category']
                    if isinstance(category_id, dict) and '$oid' in category_id:
                        category_id = category_id['$oid']
                    
                    # Récupérer la catégorie
                    try:
                        category = self.categories.find_one({'_id': ObjectId(category_id)})
                        if category:
                            category['_id'] = str(category['_id'])
                            product['category_details'] = category
                            
                            # Ajouter le nom de la catégorie principale
                            if 'parent' in category and category['parent']:
                                parent_id = category['parent']
                                if isinstance(parent_id, dict) and '$oid' in parent_id:
                                    parent_id = parent_id['$oid']
                                try:
                                    parent = self.categories.find_one({'_id': ObjectId(parent_id)})
                                    if parent:
                                        product['mainCategory'] = parent.get('name', '')
                                except:
                                    product['mainCategory'] = ''
                            else:
                                product['mainCategory'] = category.get('name', '')
                    except:
                        pass
            
            print(f"📦 {len(products)} produits chargés")
            return products
        except Exception as e:
            print(f"❌ Erreur get_all_products: {e}")
            return []
    
    def get_product_by_id(self, product_id):
        """Récupère un produit par son ID"""
        try:
            product = self.products.find_one({'_id': ObjectId(product_id)})
            if product:
                product['_id'] = str(product['_id'])
            return product
        except:
            return None
    
    def get_product_by_name(self, name):
        """Récupère un produit par son nom (recherche approximative)"""
        try:
            products = list(self.products.find({
                'name': {'$regex': name, '$options': 'i'},
                'isActive': True
            }))
            for p in products:
                p['_id'] = str(p['_id'])
            return products[0] if products else None
        except:
            return None
    
    def search_products(self, query, limit=10):
        """Recherche de produits par mots-clés"""
        try:
            # Créer une recherche textuelle
            products = list(self.products.find({
                '$and': [
                    {'isActive': True},
                    {'$or': [
                        {'name': {'$regex': query, '$options': 'i'}},
                        {'description': {'$regex': query, '$options': 'i'}},
                        {'model': {'$regex': query, '$options': 'i'}},
                        {'features': {'$elemMatch': {'$regex': query, '$options': 'i'}}}
                    ]}
                ]
            }).limit(limit))
            
            for p in products:
                p['_id'] = str(p['_id'])
            return products
        except Exception as e:
            print(f"❌ Erreur search_products: {e}")
            return []
    
    def get_products_by_category(self, category_name):
        """Récupère les produits d'une catégorie spécifique"""
        try:
            # Chercher la catégorie par nom
            category = self.categories.find_one({'name': {'$regex': f'^{category_name}$', '$options': 'i'}})
            
            if not category:
                # Chercher aussi dans les sous-catégories avec recherche plus large
                category = self.categories.find_one({'name': {'$regex': category_name, '$options': 'i'}})
            
            if category:
                category_id = category['_id']
                
                # Chercher les produits avec cette catégorie
                products = list(self.products.find({
                    'category': ObjectId(category_id),
                    'isActive': True
                }))
                
                for p in products:
                    p['_id'] = str(p['_id'])
                return products
            
            return []
        except Exception as e:
            print(f"❌ Erreur get_products_by_category: {e}")
            return []
    
    def get_products_by_main_category(self, main_category_name):
        """Récupère les produits d'une catégorie principale"""
        try:
            # Chercher la catégorie principale
            main_category = self.categories.find_one({
                'name': {'$regex': main_category_name, '$options': 'i'},
                'level': 1
            })
            
            if main_category:
                main_cat_id = main_category['_id']
                
                # Chercher toutes les sous-catégories
                subcategories = list(self.categories.find({'parent': main_cat_id}))
                subcat_ids = [sub['_id'] for sub in subcategories]
                
                # Ajouter la catégorie principale elle-même
                all_cat_ids = [main_cat_id] + subcat_ids
                
                # Chercher les produits dans toutes ces catégories
                products = list(self.products.find({
                    'category': {'$in': all_cat_ids},
                    'isActive': True
                }))
                
                for p in products:
                    p['_id'] = str(p['_id'])
                return products
            
            return []
        except Exception as e:
            print(f"❌ Erreur get_products_by_main_category: {e}")
            return []
    
    def get_all_categories(self):
        """Récupère toutes les catégories"""
        try:
            categories = list(self.categories.find())
            for cat in categories:
                cat['_id'] = str(cat['_id'])
                if 'parent' in cat and cat['parent']:
                    if isinstance(cat['parent'], dict) and '$oid' in cat['parent']:
                        cat['parent'] = cat['parent']['$oid']
                    elif isinstance(cat['parent'], ObjectId):
                        cat['parent'] = str(cat['parent'])
            return categories
        except Exception as e:
            print(f"❌ Erreur get_all_categories: {e}")
            return []
    
    def get_categories_hierarchy(self):
        """Récupère la hiérarchie complète des catégories"""
        try:
            all_cats = self.get_all_categories()
            
            # Créer un dictionnaire pour un accès facile
            cat_dict = {cat['_id']: cat for cat in all_cats}
            
            # Construire l'arborescence
            roots = []
            for cat in all_cats:
                if 'parent' not in cat or not cat['parent'] or cat['parent'] not in cat_dict:
                    # C'est une catégorie racine
                    cat['subcategories'] = []
                    roots.append(cat)
                else:
                    # C'est une sous-catégorie, l'ajouter à son parent
                    parent = cat_dict.get(cat['parent'])
                    if parent:
                        if 'subcategories' not in parent:
                            parent['subcategories'] = []
                        parent['subcategories'].append(cat)
            
            return roots
        except Exception as e:
            print(f"❌ Erreur get_categories_hierarchy: {e}")
            return []
    
    def get_subcategories(self, category_id):
        """Récupère les sous-catégories d'une catégorie"""
        try:
            cat_id = ObjectId(category_id) if isinstance(category_id, str) else category_id
            subcategories = list(self.categories.find({'parent': cat_id}))
            
            for sub in subcategories:
                sub['_id'] = str(sub['_id'])
                if 'parent' in sub and sub['parent']:
                    if isinstance(sub['parent'], ObjectId):
                        sub['parent'] = str(sub['parent'])
            
            return subcategories
        except Exception as e:
            print(f"❌ Erreur get_subcategories: {e}")
            return []
    
    def get_category_by_name(self, name):
        """Récupère une catégorie par son nom"""
        try:
            # Essayer d'abord avec une correspondance exacte
            category = self.categories.find_one({'name': name})
            
            # Sinon, chercher avec regex
            if not category:
                category = self.categories.find_one({'name': {'$regex': name, '$options': 'i'}})
            
            if category:
                category['_id'] = str(category['_id'])
                if 'parent' in category and category['parent']:
                    if isinstance(category['parent'], ObjectId):
                        category['parent'] = str(category['parent'])
            return category
        except Exception as e:
            print(f"❌ Erreur get_category_by_name: {e}")
            return None
    
    def count_products_in_category(self, category_id):
        """Compte le nombre de produits dans une catégorie"""
        try:
            cat_id = ObjectId(category_id) if isinstance(category_id, str) else category_id
            return self.products.count_documents({
                'category': cat_id,
                'isActive': True
            })
        except:
            return 0