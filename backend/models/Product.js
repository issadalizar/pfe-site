// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    prix: {
      type: Number,
      default: 0,
      min: 0,
    },

    caracteristiques: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    modele: {
      type: String,
      default: "",
    },

    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    estActif: {
      type: Boolean,
      default: true,
      index: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // NOUVEAU: Stock après modification (historique)
    stockApres: {
      type: Number,
      default: 0,
    },

    ordre: {
      type: Number,
      default: 0,
    },

    cheminImageAuto: {
      type: String,
      default: "",
    },

    nomFichierImage: {
      type: String,
      default: "",
    },
  }
);

// --- helpers ---
function makeSlug(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Fonction pour générer un nom de fichier image à partir du nom du produit
function genererNomFichierImage(nomProduit) {
  if (!nomProduit) return "";
  
  // Nettoyer le nom pour créer un nom de fichier
  let filename = nomProduit
    // Remplacer les caractères spéciaux
    .replace(/[<>:"/\\|?*]/g, '')
    // Remplacer les espaces par des underscores
    .replace(/\s+/g, '_')
    // Remplacer les parenthèses
    .replace(/[()]/g, '')
    // Remplacer les crochets
    .replace(/[\[\]]/g, '')
    // Remplacer les caractères accentués
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Convertir en minuscules
    .toLowerCase()
    // Ajouter l'extension
    + '.png';
  
  return filename;
}

// Fonction pour générer le chemin de l'image automatiquement
function genererCheminImageAuto(nomProduit, modele) {
  if (!nomProduit) return "";
  
  const filename = genererNomFichierImage(nomProduit);
  if (!filename) return "";
  
  // Déterminer la catégorie basée sur le nom ou le modèle
  const lowerName = nomProduit.toLowerCase();
  const lowerModel = (modele || "").toLowerCase();
  
  let dossierCategorie = "products";
  
  // Détection de catégorie basée sur le nom
  if (lowerName.includes("cnc")) {
    if (lowerName.includes("mill") || lowerModel.includes("kx") || lowerModel.includes("px")) {
      dossierCategorie = "CNC Milling Machine";
    } else if (lowerName.includes("lathe") || lowerName.includes("turn") || 
               lowerModel.includes("ikc") || lowerModel.includes("kc") || lowerModel.includes("pc")) {
      dossierCategorie = "CNC Turning Machine";
    } else if (lowerName.includes("virtual")) {
      dossierCategorie = "CNC Virtual Machine";
    } else {
      dossierCategorie = "CNC EDUCATION";
    }
  } else if (lowerName.includes("training") || lowerName.includes("system") || 
             lowerName.includes("electrical") || lowerModel.includes("acl") || 
             lowerModel.includes("m21") || lowerModel.includes("f1")) {
    dossierCategorie = "EDUCATION EQUIPMENT";
  } else if (lowerName.includes("probe") || lowerName.includes("test") || 
             lowerName.includes("lead") || lowerModel.includes("ptl")) {
    dossierCategorie = "Accessoires";
  }
  
  return `/images/products/${dossierCategorie}/${filename}`;
}

// Méthode d'instance pour obtenir le chemin de l'image
productSchema.methods.obtenirCheminImage = function() {
  // Si des images existent déjà, utiliser la première
  if (this.images && this.images.length > 0 && this.images[0]) {
    return this.images[0];
  }
  
  // Sinon, utiliser le chemin auto-généré
  return this.cheminImageAuto || genererCheminImageAuto(this.nom, this.modele);
};

// Méthode d'instance pour mettre à jour les infos d'image
productSchema.methods.mettreAJourInfosImage = function() {
  this.nomFichierImage = genererNomFichierImage(this.nom);
  this.cheminImageAuto = genererCheminImageAuto(this.nom, this.modele);
  
  // Si pas d'images définies, utiliser le chemin auto-généré
  if (!this.images || this.images.length === 0) {
    this.images = [this.cheminImageAuto];
  }
  
  return this;
};

// ✅ Générer slug avant save (create / save)
productSchema.pre("save", function (next) {
  if (!this.slug && this.nom) {
    this.slug = makeSlug(this.nom);
  }
  
  // Générer automatiquement les infos d'image si non définies
  if (this.isNew || this.isModified('nom') || this.isModified('modele')) {
    this.nomFichierImage = genererNomFichierImage(this.nom);
    this.cheminImageAuto = genererCheminImageAuto(this.nom, this.modele);
    
    // Si pas d'images définies, utiliser le chemin auto-généré
    if (!this.images || this.images.length === 0) {
      this.images = [this.cheminImageAuto];
    }
  }
  
  next();
});

// ✅ IMPORTANT: findOneAndUpdate / findByIdAndUpdate ne déclenche PAS pre('save')
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};

  // Supporter update direct {nom: "..."} ou {$set:{nom:"..."}}
  const incomingNom = update.nom ?? $set.nom;
  const incomingModele = update.modele ?? $set.modele;

  // Toujours updatedAt
  $set.updatedAt = new Date();

  // Si nom change et slug pas fourni => regen slug
  if (incomingNom && !($set.slug || update.slug)) {
    $set.slug = makeSlug(incomingNom);
  }

  // Si nom ou modele change => regen infos image
  if (incomingNom || incomingModele) {
    const nomAUtiliser = incomingNom || this._update.nom || this._conditions.nom;
    const modeleAUtiliser = incomingModele || this._update.modele || this._conditions.modele;
    
    if (nomAUtiliser) {
      $set.nomFichierImage = genererNomFichierImage(nomAUtiliser);
      $set.cheminImageAuto = genererCheminImageAuto(nomAUtiliser, modeleAUtiliser);
      
      // Si pas d'images fournies dans l'update, utiliser le chemin auto-généré
      if (!($set.images || update.images)) {
        $set.images = [$set.cheminImageAuto || genererCheminImageAuto(nomAUtiliser, modeleAUtiliser)];
      }
    }
  }

  // Remettre $set dans update
  update.$set = $set;

  // Si update contenait nom/slug au top-level, on les enlève pour éviter conflits
  if (update.nom !== undefined) delete update.nom;
  if (update.slug !== undefined) delete update.slug;
  if (update.modele !== undefined) delete update.modele;
  if (update.nomFichierImage !== undefined) delete update.nomFichierImage;
  if (update.cheminImageAuto !== undefined) delete update.cheminImageAuto;
  if (update.images !== undefined && !Array.isArray(update.images)) delete update.images;

  this.setUpdate(update);
  next();
});

// Indexes utiles
productSchema.index({ categorie: 1 });
productSchema.index({ estActif: 1 });
productSchema.index({ modele: 1 });

// Relation virtuelle avec les spécifications
productSchema.virtual('specifications', {
  ref: 'Specification',
  localField: '_id',
  foreignField: 'productId',
  options: { sort: { order: 1, type: 1 } }
});

// Configurez les options pour inclure les virtuals
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Export existant
export default mongoose.model('Product', productSchema);