import re

class IntentRecognizer:
    def __init__(self):
        self.patterns = {
            'greeting': [
                r'bonjour', r'salut', r'coucou', r'hello', r'hey', 
                r'bonsoir', r'bon matin', r'salutations', r'bonsoir'
            ],
            'product_search': [
                r'cherche', r'trouve', r'recherche', r'montre', 
                r'affiche', r'liste', r'catalogue', r'produits?',
                r'quelle?', r'quels?', r'as-tu', r'avez-vous',
                r'disponible'
            ],
            'comparison': [
                r'compar', r'vs', r'différence', r'lequel', 
                r'mieux', r'meilleur', r'versus', r'opposition',
                r'comparaison'
            ],
            'recommendation': [
                r'recommande', r'conseille', r'idéal', r'pour',
                r'suggestion', r'propose', r'adapté', r'parfait',
                r'meilleur choix', r'suggère'
            ],
            'price_check': [
                r'prix', r'coûte', r'combien', r'tarif', 
                r'€', r'euros?', r'cher', r'bon marché',
                r'prix de'
            ],
            'help': [
                r'aide', r'help', r'comment', r'fonctionne',
                r'peux-tu', r'capacités', r'sais faire',
                r'peux faire'
            ],
            'category_list': [
                r'catégorie', r'rayon', r'section', r'département',
                r'disponible', r'avoir', r'proposez-vous',
                r'categories?', r'types?'
            ]
        }
        
        # Catégories spécifiques du fichier productData.js
        self.specific_categories = {
            'cnc_education': [
                r'cnc for education', r'cnc éducatif', r'cnc education',
                r'machines? cnc', r'cnc'
            ],
            'voitures': [
                r'voitures?', r'automobile', r'vehicules?',
                r'systèmes? automobiles?'
            ],
            'mcp_lab': [
                r'mcp lab electronics?', r'mcp lab', r'lab electronics',
                r'équipement de laboratoire', r'mcp'
            ],
            'cnc_turning': [
                r'tournage', r'turning', r'tour cnc',
                r'cnc turning machine', r'tour'
            ],
            'cnc_milling': [
                r'fraisage', r'milling', r'fraiseuse',
                r'cnc milling machine', r'fraiseuse cnc'
            ],
            'capteurs': [
                r'capteurs?', r'actionneurs?', r'capteurs et actionneurs',
                r'mesure', r'position', r'angle'
            ],
            'electricite': [
                r'électricité', r'electricite', r'circuits? électriques?',
                r'éclairage', r'essuie[- ]?glaces?', r'charge démarrage'
            ],
            'reseaux': [
                r'réseaux?', r'multiplexés?', r'bus can',
                r'injection', r'diagnostic', r'moteur'
            ],
            'accessoires': [
                r'accessoires?', r'sondes?', r'câbles?',
                r'oscilloscope probe', r'test lead'
            ],
            'education_equipment': [
                r'education equipment', r'équipement éducatif',
                r'training system', r'système d\'apprentissage'
            ]
        }
        
    def recognize(self, message):
        message = message.lower()
        
        # Vérifier d'abord les intentions spécifiques
        for intent, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, message):
                    return intent
        
        return 'general'
    
    def recognize_specific_category(self, message):
        """Reconnaît les catégories spécifiques du fichier productData.js"""
        message = message.lower()
        
        for category, patterns in self.specific_categories.items():
            for pattern in patterns:
                if re.search(pattern, message):
                    return category
        
        return None
    
    def extract_entities(self, message):
        entities = {
            'max_price': None, 
            'min_price': None,
            'category': None, 
            'specific_category': None,  # Catégorie spécifique productData
            'main_category': None,  # Catégorie principale
            'sub_category': None,  # Sous-catégorie
            'brand': None,
            'product_names': []
        }
        
        message_lower = message.lower()
        
        # 1. Extraction des prix
        price_patterns = [
            r'moins de (\d+)\s*(?:€|euros?)',
            r'(\d+)\s*(?:€|euros?)',
            r'(\d+)\s*euros?',
            r'prix (?:maximum|max) (\d+)',
            r'(\d+)\s*€',
            r'(\d+)\s*euros',
            r'budget de (\d+)'
        ]
        
        for pattern in price_patterns:
            price_match = re.search(pattern, message_lower)
            if price_match:
                entities['max_price'] = int(price_match.group(1))
                break
        
        # 2. Extraction des catégories principales (depuis productData.js)
        main_categories = {
            'cnc for education': 'CNC for Education',
            'voitures': 'Voitures',
            'mcp lab electronics': 'MCP lab electronics'
        }
        
        for key, value in main_categories.items():
            if key in message_lower:
                entities['main_category'] = value
                break
        
        # 3. Extraction des sous-catégories (depuis productData.js)
        sub_categories = {
            'tournage': 'CNC Turning Machine',
            'turning': 'CNC Turning Machine',
            'fraisage': 'CNC Milling Machine',
            'milling': 'CNC Milling Machine',
            'capteurs': 'CAPTEURS ET ACTIONNEURS',
            'actionneurs': 'CAPTEURS ET ACTIONNEURS',
            'électricité': 'ÉLECTRICITÉ',
            'electricite': 'ÉLECTRICITÉ',
            'réseaux': 'RÉSEAUX MULTIPLEXÉS',
            'reseaux': 'RÉSEAUX MULTIPLEXÉS',
            'multiplexés': 'RÉSEAUX MULTIPLEXÉS',
            'accessoires': 'Accessoires',
            'education equipment': 'EDUCATION EQUIPMENT',
            'équipement éducatif': 'EDUCATION EQUIPMENT'
        }
        
        for key, value in sub_categories.items():
            if key in message_lower:
                entities['sub_category'] = value
                break
        
        # 4. Extraction des noms de produits spécifiques (exemples)
        product_names = [
            r'De2-Ultra',
            r'PC1 Baby',
            r'De4-Eco',
            r'De6',
            r'Fa2-Ultra',
            r'PX1 Baby',
            r'DT-M002',
            r'DT-M001',
            r'DT-E001',
            r'DTM7020',
            r'DTM7000',
            r'MT-4002V',
            r'MT-MOTEUR-MECA',
            r'MT-E5000',
            r'MT-H9000',
            r'PTL908-2H',
            r'PTL970',
            r'PTL955',
            r'PTL908-8',
            r'PTL940',
            r'PTL960',
            r'ACL-7000',
            r'M21-7100',
            r'F1-3'
        ]
        
        for product_pattern in product_names:
            if re.search(product_pattern, message, re.IGNORECASE):
                entities['product_names'].append(product_pattern)
        
        # 5. Extraction de la catégorie spécifique via la méthode dédiée
        entities['specific_category'] = self.recognize_specific_category(message)
        
        return entities