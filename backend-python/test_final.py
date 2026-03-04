import sys
import os
# Configurer l'encodage UTF-8
os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.stdout.reconfigure(encoding='utf-8')

from app import app
import json

# Tester l'API du chatbot
client = app.test_client()

# Test: Demander la liste des catégories
response = client.post('/api/chat', 
    json={'message': 'liste', 'user_id': 'test_user'},
    content_type='application/json'
)
data = json.loads(response.data)

print("=== RÉSULTATS TEST CHATBOT ===")
print(f"Status: {response.status_code}")
print(f"Catégories retournées: {len(data.get('categories', []))}")

# Afficher les catégories avec leur compte de produits
if data.get('categories'):
    for cat in data['categories'][:3]:
        print(f"  - {cat['name']}: {cat.get('count', 0)} produits")

# Test produits dans "CNC for Education"
response = client.post('/api/chat', 
    json={'message': 'CNC for Education', 'user_id': 'test_user'},
    content_type='application/json'
)
data = json.loads(response.data)
print(f"\nCatégorie 'CNC for Education':")
print(f"  Produits trouvés: {len(data.get('products', []))}")
if data.get('products'):
    for p in data['products'][:2]:
        print(f"    - {p['name']}: {p['price']}€")
