class ProductComparator:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        
    def compare_products(self, product_ids):
        products = []
        for pid in product_ids:
            p = self.data_loader.get_product_by_id(pid)
            if p:
                products.append(p)
        
        if len(products) < 2:
            return None
        
        return {
            'products': [p.to_dict() for p in products],
            'features': self._compare_features(products)
        }
    
    def compare_by_names(self, names):
        products = []
        for name in names[:2]:
            p = self.data_loader.get_product_by_name(name)
            if p:
                products.append(p)
        
        if len(products) < 2:
            return None
        
        return self.compare_products([p.id for p in products])
    
    def _compare_features(self, products):
        comparison = {}
        for p in products:
            for k, v in p.specifications.items():
                if k not in comparison:
                    comparison[k] = []
                comparison[k].append({'product': p.name, 'value': v})
        return comparison