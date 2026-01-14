import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getActiveCategories, getActiveSubcategories } from '../data/categories';
import type { Category, Subcategory } from '../data/categories';

interface CategorySelectProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategoryChange: (category: string, subcategory?: string) => void;
  className?: string;
  showSubcategories?: boolean;
  placeholder?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  selectedCategory = "",
  selectedSubcategory = "",
  onCategoryChange,
  className = "",
  showSubcategories = true,
  placeholder = "Select Category"
}) => {
  const [categories] = useState<Category[]>(getActiveCategories());
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        setSelectedCategoryId(category.id);
        setSubcategories(getActiveSubcategories(category.id));
      }
    } else {
      setSelectedCategoryId(null);
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryName = e.target.value;
    const category = categories.find(cat => cat.name === categoryName);
    
    if (category) {
      setSelectedCategoryId(category.id);
      const activeSubcategories = getActiveSubcategories(category.id);
      setSubcategories(activeSubcategories);
      
      // Reset subcategory when category changes
      onCategoryChange(categoryName, "");
    } else {
      setSelectedCategoryId(null);
      setSubcategories([]);
      onCategoryChange("", "");
    }
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategoryName = e.target.value;
    onCategoryChange(selectedCategory, subcategoryName);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Category Select */}
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{placeholder}</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} ({category.subcategories.filter(sub => sub.status === "Active").length} subcategories)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
        </div>
      </div>

      {/* Subcategory Select */}
      {showSubcategories && selectedCategoryId && subcategories.length > 0 && (
        <div className="relative">
          <label className="block text-sm font-medium mb-2">Subcategory</label>
          <div className="relative">
            <select
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Subcategory (Optional)</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.name}>
                  {subcategory.name} ({subcategory.productCount} products)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
          </div>
        </div>
      )}

      {/* Category Info */}
      {selectedCategoryId && (
        <div className="text-sm text-muted-foreground">
          {selectedSubcategory ? (
            <span>
              Selected: <strong>{selectedCategory}</strong> → <strong>{selectedSubcategory}</strong>
            </span>
          ) : (
            <span>
              Selected: <strong>{selectedCategory}</strong>
              {subcategories.length > 0 && " (You can optionally select a subcategory)"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Simplified version for inline use
export const SimpleCategorySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => {
  const categories = getActiveCategories();
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Category</option>
        {categories.map(category => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
    </div>
  );
};
