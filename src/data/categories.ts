export interface Subcategory {
  id: number;
  name: string;
  productCount: number;
  status: "Active" | "Inactive";
  parentId: number;
}

export interface Category {
  id: number;
  name: string;
  productCount: number;
  status: "Active" | "Inactive";
  subcategories: Subcategory[];
  expanded?: boolean;
}

export const categoriesData: Category[] = [
  {
    id: 1,
    name: "Clothing",
    productCount: 245,
    status: "Active",
    expanded: true,
    subcategories: [
      { id: 11, name: "T-Shirts", productCount: 45, status: "Active", parentId: 1 },
      { id: 12, name: "Shirts", productCount: 38, status: "Active", parentId: 1 },
      { id: 13, name: "Jeans", productCount: 32, status: "Active", parentId: 1 },
      { id: 14, name: "Dresses", productCount: 28, status: "Active", parentId: 1 },
      { id: 15, name: "Jackets", productCount: 15, status: "Active", parentId: 1 },
      { id: 16, name: "Hoodies", productCount: 22, status: "Active", parentId: 1 },
      { id: 17, name: "Pants", productCount: 35, status: "Active", parentId: 1 },
      { id: 18, name: "Skirts", productCount: 18, status: "Active", parentId: 1 },
      { id: 19, name: "Shorts", productCount: 12, status: "Inactive", parentId: 1 }
    ]
  },
  {
    id: 2,
    name: "Footwear",
    productCount: 156,
    status: "Active",
    expanded: false,
    subcategories: [
      { id: 21, name: "Sneakers", productCount: 45, status: "Active", parentId: 2 },
      { id: 22, name: "Boots", productCount: 28, status: "Active", parentId: 2 },
      { id: 23, name: "Sandals", productCount: 22, status: "Active", parentId: 2 },
      { id: 24, name: "Formal Shoes", productCount: 35, status: "Active", parentId: 2 },
      { id: 25, name: "Sports Shoes", productCount: 26, status: "Active", parentId: 2 }
    ]
  },
  {
    id: 3,
    name: "Accessories",
    productCount: 89,
    status: "Active",
    expanded: false,
    subcategories: [
      { id: 31, name: "Bags", productCount: 25, status: "Active", parentId: 3 },
      { id: 32, name: "Watches", productCount: 18, status: "Active", parentId: 3 },
      { id: 33, name: "Jewelry", productCount: 22, status: "Active", parentId: 3 },
      { id: 34, name: "Belts", productCount: 15, status: "Active", parentId: 3 },
      { id: 35, name: "Hats", productCount: 9, status: "Inactive", parentId: 3 }
    ]
  },
  {
    id: 4,
    name: "Electronics",
    productCount: 67,
    status: "Active",
    expanded: false,
    subcategories: [
      { id: 41, name: "Headphones", productCount: 22, status: "Active", parentId: 4 },
      { id: 42, name: "Phone Cases", productCount: 28, status: "Active", parentId: 4 },
      { id: 43, name: "Chargers", productCount: 17, status: "Active", parentId: 4 }
    ]
  }
];

// Helper functions
export const getActiveCategories = (): Category[] => {
  return categoriesData.filter(cat => cat.status === "Active");
};

export const getActiveSubcategories = (parentId: number): Subcategory[] => {
  const category = categoriesData.find(cat => cat.id === parentId);
  return category ? category.subcategories.filter(sub => sub.status === "Active") : [];
};

export const getAllActiveSubcategories = (): Subcategory[] => {
  return categoriesData.reduce((acc, category) => {
    const activeSubcategories = category.subcategories.filter(sub => sub.status === "Active");
    return [...acc, ...activeSubcategories];
  }, [] as Subcategory[]);
};

export const getCategoryById = (id: number): Category | undefined => {
  return categoriesData.find(cat => cat.id === id);
};

export const getSubcategoryById = (id: number): Subcategory | undefined => {
  for (const category of categoriesData) {
    const subcategory = category.subcategories.find(sub => sub.id === id);
    if (subcategory) return subcategory;
  }
  return undefined;
};

export const getCategoryBySubcategoryId = (subcategoryId: number): Category | undefined => {
  for (const category of categoriesData) {
    if (category.subcategories.some(sub => sub.id === subcategoryId)) {
      return category;
    }
  }
  return undefined;
};
