# models/product.py
class Product:
    def __init__(self, data):
        self.id = data.get('id', '')
        self.name = data.get('name', '')
        self.brand = data.get('brand', '')
        self.category = data.get('category', '')
        self.mainCategory = data.get('mainCategory', '')
        self.price = float(data.get('price', 0))
        self.description = data.get('description', '')
        self.features = data.get('features', [])
        self.rating = float(data.get('rating', 4.5))
        self.specifications = data.get('specifications', {})
        self.technicalSpecs = data.get('technicalSpecs', {})
        self.images = data.get('images', [])
        
        # Gestion intelligente de l'image
        raw_image = data.get('image', '')
        if raw_image:
            # Si l'image est déjà une URL complète
            if raw_image.startswith('http'):
                self.image = raw_image
            # Si l'image commence par /images/
            elif raw_image.startswith('/images/'):
                self.image = raw_image
            # Sinon, construire le chemin
            else:
                self.image = f"/images/products/{raw_image.lstrip('/')}"
        elif self.images and len(self.images) > 0:
            # Prendre la première image de la liste
            first_image = self.images[0]
            if first_image.startswith('/images/'):
                self.image = first_image
            else:
                self.image = f"/images/products/{first_image.lstrip('/')}"
        else:
            self.image = ''
        
        self.fullDescription = data.get('fullDescription', '')
        self.in_stock = data.get('inStock', True)
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'category': self.category,
            'mainCategory': self.mainCategory,
            'price': self.price,
            'description': self.description,
            'fullDescription': self.fullDescription,
            'features': self.features,
            'rating': self.rating,
            'specifications': self.specifications,
            'technicalSpecs': self.technicalSpecs,
            'image': self.image,  # URL prête pour le frontend
            'images': self.images,
            'inStock': self.in_stock
        }
    
    def get_searchable_text(self):
        """Texte pour la recherche (normalisé sans accents ni casse)"""
        from utils.text_processor import TextProcessor
        processor = TextProcessor()
        
        searchable_parts = [
            self.name,
            self.category,
            self.mainCategory,
            self.description,
            self.fullDescription,
            ' '.join(self.features) if self.features else '',
            self.brand
        ]
        text = ' '.join(str(part) for part in searchable_parts if part)
        return processor.normalize_text(text)
    
    def get_category_display(self):
        """Retourne le nom de catégorie formaté pour l'affichage"""
        category_map = {
            'CNC Turning Machine': 'Tournage CNC',
            'CNC Milling Machine': 'Fraisage CNC',
            'CAPTEURS ET ACTIONNEURS': 'Capteurs et Actionneurs',
            'ÉLECTRICITÉ': 'Électricité',
            'RÉSEAUX MULTIPLEXÉS': 'Réseaux Multiplexés',
            'Accessoires': 'Accessoires',
            'EDUCATION EQUIPMENT': 'Équipement Éducatif'
        }
        return category_map.get(self.category, self.category)
    
    def get_main_category_display(self):
        """Retourne le nom de catégorie principale formaté"""
        main_cat_map = {
            'CNC for Education': 'CNC Éducatif',
            'Voitures': 'Systèmes Automobiles',
            'MCP lab electronics': 'Électronique Lab'
        }
        return main_cat_map.get(self.mainCategory, self.mainCategory)