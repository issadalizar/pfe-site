# 📱 Page d'Accueil - Guide d'Utilisation

## Modifications Apportées

Voici les fichiers créés et modifiés pour ajouter la page d'accueil professionnelle :

### ✨ Fichiers Créés

1. **`frontend/src/pages/Home.jsx`** 
   - Page d'accueil complète avec toutes les sections
   - Récupère dynamiquement les produits et catégories depuis l'API
   - Design moderne et responsif basé sur votre mockup

2. **`frontend/src/styles/home.css`**
   - Feuille de style dédiée avec animations
   - Dégradés, transitions fluides et effets hover
   - Responsive pour mobile, tablette et desktop

### 📝 Fichiers Modifiés

1. **`frontend/src/App.jsx`**
   - Restructuration du routage
   - Route `/home` sans sidebar (page publique)
   - Routes `/dashboard`, `/products`, etc. avec sidebar (admin)

## 🌐 Accès à la Page d'Accueil

### URL
```
http://localhost:5173/home  (en développement Vite)
http://localhost:5173/      (redirection vers dashboard par défaut)
```

### Navigation
Les utilisateurs peuvent accéder à la page d'accueil via :
- URL directe : `/home`
- Bouton "Se connecter" dans le header
- Logo "UniverTechno+" dans la navbar

## 🎨 Sections de la Page d'Accueil

### 1. **Navigation Bar**
- Logo UniverTechno+
- Liens de navigation (Produits, Secteurs, Contact)
- Bouton Se connecter

### 2. **Section Héro**
- Titre et description principal
- 2 boutons d'appel à l'action
- Illustration réactive

### 3. **Tendances Actuelles**
- Affiche les 6 premiers produits
- Récupérés dynamiquement de l'API
- Carte produit avec note, prix et bouton détails

### 4. **Nos Secteurs d'Expertise**
- Affiche les 4 premières catégories
- Avec icônes, couleurs distinctes et hover effects
- Lien pour en savoir plus

### 5. **Témoignages Clients**
- 3 témoignages statiques (personnalisables)
- Notes 5 étoiles, photos de profil, citations

### 6. **Section CTA (Call-To-Action)**
- Encourage les visites de démonstration
- Bouton d'engagement

### 7. **Footer**
- 4 colonnes : Services, À Propos, Partenaires, Contact
- Liens sociaux et copyright
- Informations de contact

## 🔄 Flux de Données

```
Home.jsx
├── Récupère producttAPI.getAll() 
│   └── Affiche les 6 premiers dans "Tendances Actuelles"
└── Récupère categoryAPI.getAll()
    └── Filtre les catégories principales
    └── Affiche les 4 premières dans "Secteurs d'Expertise"
```

## 🎯 Caractéristiques Principales

✅ **Responsive Design** - Adapté mobile, tablette, desktop
✅ **Chargement Dynamique** - Données en temps réel de l'API
✅ **Animations Fluides** - Transitions et effects hover
✅ **Bootstrap 5** - Composants modernes
✅ **Aucun Fichier Supprimé** - Tous vos fichiers existants sont conservés
✅ **Séparation Admin/Public** - 2 layouts différents selon la route

## 🚀 Lancement de l'Application

```bash
# À la racine du projet
npm install

# Frontend
cd frontend
npm install
npm run dev

# Backend (autre terminal)
cd backend
npm install
npm start
```

Accédez ensuite à `http://localhost:5173/home`

## 🔧 Personnalisations Possibles

- **Témoignages** : Modifiez le tableau des témoignages dans la section correspondante
- **Couleurs** : Ajustez les codes couleur dans `home.css`
- **Icônes** : Changez les emojis ou utilisez des icônes React Icons
- **Images** : Remplacez les placeholders par vos vraies images

## ⚙️ Configuration API

Le projet utilise `http://localhost:5000/api` comme base URL.
Assurez-vous que votre backend tourne sur le port 5000.

## 📊 Structure Complète Conservée

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          ✨ NOUVEAU
│   │   ├── Dashboard.jsx     ✓ Conservé
│   │   ├── Products.jsx      ✓ Conservé
│   │   ├── Categories.jsx    ✓ Conservé
│   │   └── ...
│   ├── components/           ✓ Tous conservés
│   ├── services/
│   │   └── api.js            ✓ Conservé
│   ├── styles/
│   │   └── home.css          ✨ NOUVEAU
│   ├── App.jsx               📝 MODIFIÉ
│   └── main.jsx              ✓ Conservé
```

## 💡 Notes

- La page d'accueil ne montre PAS la sidebar
- Le dashboard et les pages admin conservent leur layout original avec sidebar
- Les routes `/` redirige vers `/dashboard` (vous pouvez changer vers `/home` si préféré)
- Tous les styles sont isolés dans `home.css` pour éviter les conflits

---

**Profitez de votre nouvelle page d'accueil ! 🎉**
