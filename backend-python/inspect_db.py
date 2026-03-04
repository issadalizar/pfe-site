from services.mongo_service import MongoService
import json

mongo = MongoService()

print('=== STRUCTURE DES CATÉGORIES ===')
categories = mongo.get_categories_hierarchy()
for cat in categories:
    print(f"\nCatégorie: {cat['name']} (ID: {cat['_id']})")
    print(f"  Level: {cat.get('level')}")
    print(f"  Parent: {cat.get('parent')}")
    if 'subcategories' in cat and cat['subcategories']:
        print(f"  Sous-catégories: {len(cat['subcategories'])}")
        for sub in cat['subcategories']:
            print(f"    - {sub['name']} (ID: {sub['_id']})")

# Vérifier un produit en détail
print("\n=== DÉTAIL D'UN PRODUIT ===")
products = mongo.get_all_products()
if products:
    p = products[0]
    print(f"Nom: {p.get('nom')}")
    print(f"Prix brut: {p.get('prix')}")
    print(f"Catégorie ID: {p.get('categorie')}")
    print(f"Tous les champs: {list(p.keys())}")
