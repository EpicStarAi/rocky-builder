import React from 'react';
import { categories } from '../../data/products';

interface CatalogMenuProps {
  onSelectCategory?: (slug: string) => void;
  selectedCategory?: string;
}

export const CatalogMenu: React.FC<CatalogMenuProps> = ({ onSelectCategory, selectedCategory }) => {
  console.log('CatalogMenu categories:', categories);
  return (
    <aside className="w-64 bg-white border-r h-full overflow-y-auto">
      <div className="p-2 text-xs text-gray-400">Категорий: {categories.length}</div>
      <nav>
        <ul>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedCategory === cat.slug ? 'bg-gray-200 font-bold' : ''}`}
                onClick={() => onSelectCategory?.(cat.slug)}
              >
                <span className="inline-block w-8 h-8 mr-2 align-middle">
                  <img src={cat.image} alt={cat.nameRu} className="object-cover w-8 h-8 rounded" />
                </span>
                {cat.nameRu}
                {cat.productCount !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">({cat.productCount})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
