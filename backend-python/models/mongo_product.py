# models/mongo_product.py
class MongoProduct:
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.name = data.get('name', '')
        self.description = data.get('description', '')
        self.shortDescription = data.get('shortDescription', '')
        self.price = float(data.get('price', 0))
        self.features = data.get('features', [])
        self.images = data.get('images', [])
        self.image = self.images[0] if self.images else ''
        self.model = data.get('model', '')
        self.slug = data.get('slug', '')
        self.isActive = data.get('isActive', True)
        self.isFeatured = data.get('isFeatured', False)
        self.stock = int(data.get('stock', 0))
        self.order = data.get('order', 0)
        
        # Informations de catégorie
        self.category_id = None
        self.category_name = ''
        self.mainCategory = ''
        self.category_details = data.get('category_details', {})
        
        if 'category_details' in data and data['category_details']:
            self.category_name = data['category_details'].get('name', '')
            self.mainCategory = data.get('mainCategory', '')
            self.category_id = data['category_details'].get('_id', '')
        elif 'category' in data:
            if isinstance(data['category'], dict) and '$oid' in data['category']:
                self.category_id = data['category']['$oid']
        
        # ===== CORRECTION DES IMAGES =====
        # Si pas d'image en base, générer un chemin basé sur la catégorie et le nom
        if not self.image or self.image.strip() == '':
            self.image = self._generate_image_path()
    
    def _generate_image_path(self):
        """Génère un chemin d'image basé sur la catégorie et le nom du produit"""
        if not self.category_name or not self.name:
            return ''
        
        # Déterminer la catégorie principale et sous-catégorie
        main_cat = self.mainCategory or 'Produits'
        sub_cat = self.category_name
        prod_name = self.name
        
        # Normaliser les noms pour les chemins
        def clean_name(name):
            return (name or '').strip().replace('\\', '/').replace('  ', ' ')
        
        main_cat = clean_name(main_cat)
        sub_cat = clean_name(sub_cat)
        prod_name = clean_name(prod_name)
        
        # Construire les chemins d'image possibles
        # Priorité: /images/products/MainCategory/SubCategory/ProductName.png
        image_path = f"/images/products/{main_cat}/{sub_cat}/{prod_name}.png"
        
        return image_path
        
    def to_dict(self):
        """Convertir le produit en dictionnaire avec images correctement formatées"""
        # Formater l'image pour s'assurer qu'elle a le bon chemin
        image_url = self.image or ''
        
        # Si l'image existe et n'est pas une URL complète, s'assurer qu'elle commence par /
        if image_url and not image_url.startswith('http'):
            if not image_url.startswith('/'):
                image_url = '/' + image_url
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description[:200] + '...' if len(self.description) > 200 else self.description,
            'shortDescription': self.shortDescription,
            'price': self.price,
            'features': self.features[:3] if self.features else [],  # Limiter à 3 features
            'images': self.images,
            'image': image_url,  # Image formatée correctement
            'model': self.model,
            'slug': self.slug,
            'isActive': self.isActive,
            'isFeatured': self.isFeatured,
            'stock': self.stock,
            'category': self.category_name,
            'category_id': self.category_id,
            'mainCategory': self.mainCategory,
            'rating': 4.5  # Note par défaut
        }
    
    def get_searchable_text(self):
        """Texte pour la recherche (normalisé sans accents ni casse)"""
        from utils.text_processor import TextProcessor
        processor = TextProcessor()
        
        parts = [
            self.name,
            self.description,
            self.shortDescription,
            self.category_name,
            self.mainCategory,
            self.model,
            ' '.join(self.features) if self.features else ''
        ]
        text = ' '.join(str(p) for p in parts if p)
        return processor.normalize_text(text)