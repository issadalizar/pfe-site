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

    isActive: {
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

// ✅ Générer slug avant save (create / save)
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = makeSlug(this.name);
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
  const incomingSlug = update.slug ?? $set.slug;

  // Toujours updatedAt
  $set.updatedAt = new Date();

  // Si name change et slug pas fourni => regen slug
  if (incomingName && !incomingSlug) {
    $set.slug = makeSlug(incomingName);
  }

  // Remettre $set dans update
  update.$set = $set;

  // Si update contenait name/slug au top-level, on les enlève pour éviter conflits
  if (update.name !== undefined) delete update.name;
  if (update.slug !== undefined) delete update.slug;

  this.setUpdate(update);
  next();
});

// Indexes utiles
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
