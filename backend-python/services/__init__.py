# Services package
from services.data_loader import ProductDataLoader
data_loader = ProductDataLoader()
data_loader.load_products()  # Charger les produits au démarrage

