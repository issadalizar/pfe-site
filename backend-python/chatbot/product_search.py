class ProductSearch:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.is_trained = True
        from utils.text_processor import TextProcessor
        self.text_processor = TextProcessor()
        
    def search_by_keywords(self, keywords, limit=10):
        if not keywords:
            return []
        
        results = []
        for product in self.data_loader.get_all_products():
            text = product.get_searchable_text()
            # Normaliser les mots-clés pour comparaison
            score = sum(1 for k in keywords if self.text_processor.normalize_text(k) in text)
            if score > 0:
                results.append((score, product))
        
        results.sort(reverse=True)
        return [p for _, p in results][:limit]
    
    def train(self):
        pass