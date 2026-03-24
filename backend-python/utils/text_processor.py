import re
import unicodedata

class TextProcessor:
    def __init__(self):
        pass
    
    def normalize_text(self, text):
        """
        Normalise le texte pour une recherche insensible à la casse et aux accents
        Exemples:
            - "Éducation" -> "education"
            - "DE4" -> "de4"
            - "Café" -> "cafe"
        """
        if not text:
            return ""
        
        # 1. Convertir en minuscules
        text = text.lower()
        
        # 2. Supprimer les accents (décomposition unicode)
        text = unicodedata.normalize('NFD', text)
        text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
        
        # 3. Supprimer les caractères spéciaux sauf espaces et tirets
        text = re.sub(r'[^\w\s-]', '', text)
        
        return text
        
    def extract_keywords(self, text):
        words = re.findall(r'\b\w{3,}\b', text.lower())
        stop_words = {'pour', 'avec', 'dans', 'vous', 'nous', 'votre'}
        return [w for w in words if w not in stop_words]
    
    def extract_price(self, text):
        price = re.search(r'(\d+)\s*(?:€|euros?)', text.lower())
        return int(price.group(1)) if price else None