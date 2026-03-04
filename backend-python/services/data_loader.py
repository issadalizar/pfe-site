# services/data_loader.py
import json
import re
import os
import hashlib
from models.product import Product

class DataLoader:
    def __init__(self, data_path=None):
        self.data_path = data_path
        self.products = []
        self.products_by_id = {}
        
    def load_products(self):
        if not self.data_path or not os.path.exists(self.data_path):
            print(f"❌ Fichier non trouvé: {self.data_path}")
            return []
        
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
                print(f" Analyse du fichier: {self.data_path}")
                
                # Découper par produit
                product_blocks = re.split(r'\n\s*\'', content)
                products = []
                
                for i, block in enumerate(product_blocks):
                    if 'title:' in block and 'price:' in block:
                        try:
                            # Extraire le nom du produit
                            name_match = re.search(r'([^\']+)\':\s*\{', block)
                            if not name_match:
                                continue
                                
                            product_name = name_match.group(1).strip()
                            
                            # Extraire le titre
                            title_match = re.search(r'title:\s*\'([^\']+)\'', block)
                            title = title_match.group(1) if title_match else product_name
                            
                            # Extraire la catégorie
                            cat_match = re.search(r'category:\s*\'([^\']+)\'', block)
                            category = cat_match.group(1) if cat_match else 'General'
                            
                            # Extraire la catégorie principale
                            main_cat_match = re.search(r'mainCategory:\s*\'([^\']+)\'', block)
                            main_category = main_cat_match.group(1) if main_cat_match else 'General'
                            
                            # Extraire le prix
                            price_match = re.search(r'price:\s*(\d+)', block)
                            price = float(price_match.group(1)) if price_match else 0
                            
                            # Extraire les features
                            features = []
                            features_section = re.search(r'features:\s*\[(.*?)\]', block, re.DOTALL)
                            if features_section:
                                feature_items = re.findall(r'\'([^\']+)\'', features_section.group(1))
                                features = feature_items
                            
                            # Extraire la description
                            desc_match = re.search(r'fullDescription:\s*\'([^\']+)\'', block)
                            description = desc_match.group(1) if desc_match else ''
                            
                            # Extraire les spécifications
                            specifications = {}
                            specs_section = re.search(r'specifications:\s*\{(.*?)\}', block, re.DOTALL)
                            if specs_section:
                                spec_items = re.findall(r'\'([^\']+)\':\s*\'([^\']+)\'', specs_section.group(1))
                                for k, v in spec_items:
                                    specifications[k] = v
                            
                            # Extraire les technicalSpecs
                            technicalSpecs = {}
                            tech_section = re.search(r'technicalSpecs:\s*\{(.*?)\}', block, re.DOTALL)
                            if tech_section:
                                tech_items = re.findall(r'\'([^\']+)\':\s*\'([^\']+)\'', tech_section.group(1))
                                for k, v in tech_items:
                                    technicalSpecs[k] = v
                            
                            # Extraire les images
                            images = []
                            images_section = re.search(r'images:\s*\[(.*?)\]', block, re.DOTALL)
                            if images_section:
                                image_items = re.findall(r'\'([^\']+)\'', images_section.group(1))
                                images = image_items
                            
                            # Déterminer la marque
                            if 'CNC' in main_category:
                                brand = 'CNC Expert'
                            elif 'Voitures' in main_category:
                                brand = 'Didactech Auto'
                            elif 'MCP' in main_category:
                                brand = 'MCP Lab'
                            else:
                                brand = 'Generic'
                            
                            # Créer l'ID
                            product_id = hashlib.md5(product_name.encode()).hexdigest()[:8]
                            
                            # IMPORTANT: Construire l'URL de l'image pour le frontend
                            # Les images sont dans frontend/public/images/products/
                            # Donc l'URL doit commencer par /images/products/
                            image_url = ''
                            if images:
                                # Nettoyer le chemin pour qu'il commence par /images/products/
                                raw_path = images[0]
                                if raw_path.startswith('/images/'):
                                    image_url = raw_path
                                else:
                                    # Enlever les éventuels préfixes
                                    clean_path = raw_path.replace('/images/products/', '')
                                    clean_path = clean_path.replace('images/products/', '')
                                    image_url = f'/images/products/{clean_path}'
                            
                            # Créer le dictionnaire produit
                            product_dict = {
                                'id': product_id,
                                'name': title,
                                'category': category,
                                'mainCategory': main_category,
                                'price': price,
                                'features': features,
                                'description': ' • '.join(features) if features else description,
                                'fullDescription': description,
                                'brand': brand,
                                'rating': 4.5,
                                'inStock': True,
                                'image': image_url,  # URL corrigée
                                'images': images,  # Images originales
                                'specifications': specifications,
                                'technicalSpecs': technicalSpecs
                            }
                            
                            products.append(Product(product_dict))
                            
                        except Exception as e:
                            print(f"⚠️ Erreur sur un produit: {e}")
                            continue
                
                self.products = products
                self.products_by_id = {p.id: p for p in self.products}
                
                print(f" {len(self.products)} produits chargés avec succès!")
                
                # Compter par catégorie principale
                categories = {}
                for p in self.products:
                    cat = p.mainCategory
                    categories[cat] = categories.get(cat, 0) + 1
                
                for cat, count in categories.items():
                    print(f"   • {cat}: {count} produits")
                    # Afficher un exemple d'image pour debug
                    sample = next((p for p in self.products if p.mainCategory == cat), None)
                    if sample and sample.image:
                        print(f"     Exemple image: {sample.image}")
                
                return self.products
                
        except Exception as e:
            print(f" Erreur générale: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def get_all_products(self):
        return self.products
    
    def get_product_by_id(self, product_id):
        return self.products_by_id.get(product_id)
    
    def get_product_by_name(self, name):
        name = name.lower()
        for p in self.products:
            if name in p.name.lower():
                return p
        return None
    
    def search_by_name(self, query):
        query = query.lower()
        results = []
        for p in self.products:
            if query in p.name.lower() or query in p.category.lower():
                results.append(p)
        return results