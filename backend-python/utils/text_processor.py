# utils/text_processor.py
import re
import unicodedata
from utils.constants import STOP_WORDS  # ← Importer les constantes

class TextProcessor:
    def __init__(self, language='fr'):
        self.language = language
        self.stop_words = STOP_WORDS.get(language, STOP_WORDS['fr'])
    
    def normalize_text(self, text):
        if not text:
            return ""
        text = text.lower()
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        text = re.sub(r'[^\w\s-]', '', text)
        return text
    
    def tokenize(self, text, min_length=2):
        """Méthode UNIQUE pour tokenizer - utilisée par TOUS les modules"""
        if not text:
            return []
        normalized = self.normalize_text(text)
        words = re.findall(r'\b\w{' + str(min_length) + r',}\b', normalized)
        return [w for w in words if w not in self.stop_words]
    
    def extract_keywords(self, text):
        """Pour compatibilité avec le code existant"""
        return self.tokenize(text, min_length=3)
    
    def extract_price(self, text):
        price = re.search(r'(\d+)\s*(?:€|euros?)', text.lower())
        return int(price.group(1)) if price else None