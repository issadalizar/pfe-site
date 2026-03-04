from services.mongo_service import MongoService
from models.mongo_product import MongoProduct

mongo = MongoService()
products = mongo.get_all_products()

print('=== PREMIERS PRODUITS ===')
for i, p in enumerate(products[:3]):
    prod = MongoProduct(p)
    print(f"\nProduit {i+1}:")
    print(f"  Nom: {prod.name}")
    print(f"  Prix: {prod.price}")
    print(f"  Catégorie: {prod.category_name}")
    print(f"  Stock: {prod.stock}")

print(f"\n✅ Total: {len(products)} produits chargés")

# Tester le chargement par catégorie
print("\n=== TEST PAR CATÉGORIE ===")
categories = mongo.get_categories_hierarchy()
if categories:
    cat = categories[0]
    print(f"Catégorie: {cat.get('name')}")
    products_in_cat = mongo.get_products_by_category(cat['name'])
    print(f"Produits: {len(products_in_cat)}")
    if products_in_cat:
        p = MongoProduct(products_in_cat[0])
        print(f"  1er produit: {p.name} - {p.price}€")
