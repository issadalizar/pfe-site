// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
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

    shortDescription: {
      type: String,
      default: "",
      maxlength: 150,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    features: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    model: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    link: {
      type: String,
      default: "",
    },

    isActive: {//nbadalha isAvailable
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    order: {
      type: Number,
      default: 0,
    },

    // Nouveau champ : chemin de l'image généré automatiquement
    autoImagePath: {
      type: String,
      default: "",
    },

    // Nouveau champ : nom du fichier image nettoyé
    imageFilename: {
      type: String,
      default: "",
    },
  },
  {
    // ✅ Mongoose gère createdAt / updatedAt automatiquement
    timestamps: true,
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
function generateImageFilename(productName) {
  if (!productName) return "";
  
  // Nettoyer le nom pour créer un nom de fichier
  let filename = productName
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
function generateAutoImagePath(productName, model) {
  if (!productName) return "";
  
  const filename = generateImageFilename(productName);
  if (!filename) return "";
  
  // Déterminer la catégorie basée sur le nom ou le modèle
  const lowerName = productName.toLowerCase();
  const lowerModel = (model || "").toLowerCase();
  
  let categoryFolder = "products";
  
  // Détection de catégorie basée sur le nom
  if (lowerName.includes("cnc")) {
    if (lowerName.includes("mill") || lowerModel.includes("kx") || lowerModel.includes("px")) {
      categoryFolder = "CNC Milling Machine";
    } else if (lowerName.includes("lathe") || lowerName.includes("turn") || 
               lowerModel.includes("ikc") || lowerModel.includes("kc") || lowerModel.includes("pc")) {
      categoryFolder = "CNC Turning Machine";
    } else if (lowerName.includes("virtual")) {
      categoryFolder = "CNC Virtual Machine";
    } else {
      categoryFolder = "CNC EDUCATION";
    }
  } else if (lowerName.includes("training") || lowerName.includes("system") || 
             lowerName.includes("electrical") || lowerModel.includes("acl") || 
             lowerModel.includes("m21") || lowerModel.includes("f1")) {
    categoryFolder = "EDUCATION EQUIPMENT";
  } else if (lowerName.includes("probe") || lowerName.includes("test") || 
             lowerName.includes("lead") || lowerModel.includes("ptl")) {
    categoryFolder = "Accessoires";
  }
  
  return `/images/products/${categoryFolder}/${filename}`;
}

// Méthode d'instance pour obtenir le chemin de l'image
productSchema.methods.getImagePath = function() {
  // Si des images existent déjà, utiliser la première
  if (this.images && this.images.length > 0 && this.images[0]) {
    return this.images[0];
  }
  
  // Sinon, utiliser le chemin auto-généré
  return this.autoImagePath || generateAutoImagePath(this.name, this.model);
};

// Méthode d'instance pour mettre à jour les infos d'image
productSchema.methods.updateImageInfo = function() {
  this.imageFilename = generateImageFilename(this.name);
  this.autoImagePath = generateAutoImagePath(this.name, this.model);
  
  // Si pas d'images définies, utiliser le chemin auto-généré
  if (!this.images || this.images.length === 0) {
    this.images = [this.autoImagePath];
  }
  
  return this;
};

// ✅ Générer slug avant save (create / save)
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = makeSlug(this.name);
  }
  
  // Générer automatiquement les infos d'image si non définies
  if (this.isNew || this.isModified('name') || this.isModified('model')) {
    this.imageFilename = generateImageFilename(this.name);
    this.autoImagePath = generateAutoImagePath(this.name, this.model);
    
    // Si pas d'images définies, utiliser le chemin auto-généré
    if (!this.images || this.images.length === 0) {
      this.images = [this.autoImagePath];
    }
  }
  
  next();
});

// ✅ IMPORTANT: findOneAndUpdate / findByIdAndUpdate ne déclenche PAS pre('save')
// Donc on met à jour updatedAt et slug ici aussi
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};

  // Supporter update direct {name: "..."} ou {$set:{name:"..."}}
  const incomingName = update.name ?? $set.name;
  const incomingModel = update.model ?? $set.model;

  // Toujours updatedAt
  $set.updatedAt = new Date();

  // Si name change et slug pas fourni => regen slug
  if (incomingName && !($set.slug || update.slug)) {
    $set.slug = makeSlug(incomingName);
  }

  // Si name ou model change => regen infos image
  if (incomingName || incomingModel) {
    const nameToUse = incomingName || this._update.name || this._conditions.name;
    const modelToUse = incomingModel || this._update.model || this._conditions.model;
    
    if (nameToUse) {
      $set.imageFilename = generateImageFilename(nameToUse);
      $set.autoImagePath = generateAutoImagePath(nameToUse, modelToUse);
      
      // Si pas d'images fournies dans l'update, utiliser le chemin auto-généré
      if (!($set.images || update.images)) {
        $set.images = [$set.autoImagePath || generateAutoImagePath(nameToUse, modelToUse)];
      }
    }
  }

  // Remettre $set dans update
  update.$set = $set;

  // Si update contenait name/slug au top-level, on les enlève pour éviter conflits
  if (update.name !== undefined) delete update.name;
  if (update.slug !== undefined) delete update.slug;
  if (update.model !== undefined) delete update.model;
  if (update.imageFilename !== undefined) delete update.imageFilename;
  if (update.autoImagePath !== undefined) delete update.autoImagePath;
  if (update.images !== undefined && !Array.isArray(update.images)) delete update.images;

  this.setUpdate(update);
  next();
});

// Indexes utiles
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ model: 1 }); // Nouvel index pour le modèle

const Product = mongoose.model("Product", productSchema);

export default Product;