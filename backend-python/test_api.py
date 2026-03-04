from app import app
import json

# Tester l'API du chatbot
client = app.test_client()

# Test 1: Demander la liste des catégories
print("=== TEST 1: Liste des catégories ===")
response = client.post('/api/chat', 
    json={'message': 'liste', 'user_id': 'test_user'},
    content_type='application/json'
)
data = json.loads(response.data)
print(f"Status: {response.status_code}")
print(f"Response: {data['response'][:100]}...")
print(f"Catégories: {len(data.get('categories', []))}")

# Test 2: Cliquer sur une catégorie
print("\n=== TEST 2: Produits d'une catégorie ===")
response = client.post('/api/chat', 
    json={'message': 'CNC for Education', 'user_id': 'test_user'},
    content_type='application/json'
)
data = json.loads(response.data)
print(f"Status: {response.status_code}")
print(f"Response: {data['response'][:100]}...")
print(f"Produits trouvés: {len(data.get('products', []))}")
if data.get('products'):
    p = data['products'][0]
    print(f"  1er produit: {p.get('name')} - {p.get('price')}€")

# Test 3: Demander les détails d'une catégorie de sous-produits
print("\n=== TEST 3: Sous-catégorie ===")
response = client.post('/api/chat', 
    json={'message': 'CNC Turning Machine', 'user_id': 'test_user'},
    content_type='application/json'
)
data = json.loads(response.data)
print(f"Status: {response.status_code}")
print(f"Response: {data['response'][:100]}...")
print(f"Produits: {len(data.get('products', []))}")
