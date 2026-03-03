class RecommendationEngine:
    def __init__(self, data_loader, product_search):
        self.data_loader = data_loader
        self.product_search = product_search
        
    def recommend_by_criteria(self, criteria):
        products = self.data_loader.get_all_products()
        
        if criteria.get('max_price'):
            products = [p for p in products if p.price <= criteria['max_price']]
        
        if criteria.get('category'):
            products = [p for p in products if criteria['category'] in p.category.lower()]
        
        return products[:5]
    
    def get_trending_products(self, limit=3):
        return self.data_loader.get_all_products()[:limit]