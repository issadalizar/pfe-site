// src/components/CategoryList.jsx
import React from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaSchool, 
  FaBook,
  FaFolder,
  FaChevronRight,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function CategoryList({ 
  categories, 
  onEdit, 
  onDelete,
  onAddSubcategory,
  loading 
}) {
  const getCategoryIcon = (level, customIcon) => {
    if (customIcon) return customIcon;
    
    switch (level) {
      case 1: return <FaSchool className="text-primary me-2" />;
      case 2: return <FaBook className="text-success me-2" />;
      default: return <FaFolder className="text-secondary me-2" />;
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      1: "bg-primary",
      2: "bg-success",
      3: "bg-info"
    };
    
    return (
      <span className={`badge ${colors[level] || 'bg-secondary'} me-2`}>
        N{level}
      </span>
    );
  };

  const getParentInfo = (parentId) => {
    if (!parentId) return null;
    const parent = categories.find(c => c._id === parentId);
    return parent ? (
      <small className="text-muted">
        <FaChevronRight className="mx-1" size={10} />
        {parent.name}
      </small>
    ) : null;
  };

  const getSubcategories = (categoryId) => {
    return categories.filter(c => c.parent?._id === categoryId);
  };

  const renderCategoryRow = (category, depth = 0) => {
    const subcategories = getSubcategories(category._id);
    const hasChildren = subcategories.length > 0;
    
    return (
      <React.Fragment key={category._id}>
        <tr className="align-middle">
          <td style={{ paddingLeft: `${depth * 40}px` }}>
            <div className="d-flex align-items-center">
              {getCategoryIcon(category.level, category.icon)}
              <div>
                <strong>{category.name}</strong>
                {getParentInfo(category.parent?._id)}
              </div>
            </div>
          </td>
          <td>
            <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
              {category.description || (
                <span className="text-muted">Aucune description</span>
              )}
            </span>
          </td>
          <td>
            <div className="d-flex align-items-center">
              {getLevelBadge(category.level)}
              <small>{category.slug}</small>
            </div>
          </td>
          <td>
            <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'}`}>
              {category.isActive ? (
                <>
                  <FaEye className="me-1" />
                  Actif
                </>
              ) : (
                <>
                  <FaEyeSlash className="me-1" />
                  Inactif
                </>
              )}
            </span>
          </td>
          <td>
            <div className="btn-group btn-group-sm">
              <Link
                to={`/category/${category._id}`} // ← Ceci va vers la page publique
                className="btn btn-outline-primary"
                title="Voir la catégorie sur le site public" >
                <FaEye />
              </Link>
              <button
                className="btn btn-outline-warning"
                onClick={() => onEdit(category)}
                title="Modifier"
              >
                <FaEdit />
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => onDelete(category._id)}
                title="Supprimer"
              >
                <FaTrash />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Render subcategories recursively */}
        {hasChildren && subcategories.map(subCat => 
          renderCategoryRow(subCat, depth + 1)
        )}
      </React.Fragment>
    );
  };

  const rootCategories = categories.filter(c => !c.parent);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des catégories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-5">
        <FaFolder className="text-muted mb-3" size={48} />
        <h5 className="text-muted">Aucune catégorie trouvée</h5>
        <p className="text-muted">
          Commencez par créer votre première catégorie
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Niveau / Slug</th>
            <th>Statut</th>
            <th width="140">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rootCategories.map(category => renderCategoryRow(category))}
        </tbody>
      </table>
    </div>
  );
}