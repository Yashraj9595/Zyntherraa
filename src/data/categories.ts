import { categoryApi } from '../utils/api';

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
  image?: string; // Category image URL
  subcategories: Subcategory[];
  expanded?: boolean;
}

// Export functions that fetch data from backend instead of using static data
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      // Convert backend format to frontend format
      return categories
        .filter((cat: any) => cat.status === "Active")
        .map((cat: any, index: number) => ({
          id: index + 1, // Generate numeric IDs for frontend compatibility
          name: cat.name,
          productCount: cat.productCount,
          status: cat.status,
          subcategories: cat.subcategories.map((sub: any, subIndex: number) => ({
            id: (index + 1) * 10 + subIndex, // Generate numeric IDs for subcategories
            name: sub.name,
            productCount: sub.productCount,
            status: sub.status,
            parentId: index + 1
          })),
          expanded: false
        }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const getActiveSubcategories = async (parentId: number): Promise<Subcategory[]> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      const category = categories.find((cat: any, index: number) => index + 1 === parentId);
      if (category) {
        return category.subcategories
          .filter((sub: any) => sub.status === "Active")
          .map((sub: any, subIndex: number) => ({
            id: parentId * 10 + subIndex,
            name: sub.name,
            productCount: sub.productCount,
            status: sub.status,
            parentId: parentId
          }));
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
    return [];
  }
};

export const getAllActiveSubcategories = async (): Promise<Subcategory[]> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      return categories.reduce((acc: Subcategory[], category: any, catIndex: number) => {
        const activeSubcategories = category.subcategories
          .filter((sub: any) => sub.status === "Active")
          .map((sub: any, subIndex: number) => ({
            id: (catIndex + 1) * 10 + subIndex,
            name: sub.name,
            productCount: sub.productCount,
            status: sub.status,
            parentId: catIndex + 1
          }));
        return [...acc, ...activeSubcategories];
      }, [] as Subcategory[]);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch all subcategories:', error);
    return [];
  }
};

export const getCategoryById = async (id: number): Promise<Category | undefined> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      const category = categories.find((cat: any, index: number) => index + 1 === id);
      if (category) {
        return {
          id: id,
          name: category.name,
          productCount: category.productCount,
          status: category.status,
          subcategories: category.subcategories.map((sub: any, subIndex: number) => ({
            id: id * 10 + subIndex,
            name: sub.name,
            productCount: sub.productCount,
            status: sub.status,
            parentId: id
          })),
          expanded: false
        };
      }
    }
    return undefined;
  } catch (error) {
    console.error('Failed to fetch category by ID:', error);
    return undefined;
  }
};

export const getSubcategoryById = async (id: number): Promise<Subcategory | undefined> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      for (let catIndex = 0; catIndex < categories.length; catIndex++) {
        const category = categories[catIndex];
        for (let subIndex = 0; subIndex < category.subcategories.length; subIndex++) {
          const subcategory = category.subcategories[subIndex];
          const generatedId = (catIndex + 1) * 10 + subIndex;
          if (generatedId === id) {
            return {
              id: generatedId,
              name: subcategory.name,
              productCount: subcategory.productCount,
              status: subcategory.status,
              parentId: catIndex + 1
            };
          }
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error('Failed to fetch subcategory by ID:', error);
    return undefined;
  }
};

export const getCategoryBySubcategoryId = async (subcategoryId: number): Promise<Category | undefined> => {
  try {
    const response = await categoryApi.getAll();
    if (response.data) {
      const categories = Array.isArray(response.data) ? response.data : [];
      for (let catIndex = 0; catIndex < categories.length; catIndex++) {
        const category = categories[catIndex];
        for (let subIndex = 0; subIndex < category.subcategories.length; subIndex++) {
          const generatedId = (catIndex + 1) * 10 + subIndex;
          if (generatedId === subcategoryId) {
            return {
              id: catIndex + 1,
              name: category.name,
              productCount: category.productCount,
              status: category.status,
              subcategories: category.subcategories.map((sub: any, idx: number) => ({
                id: (catIndex + 1) * 10 + idx,
                name: sub.name,
                productCount: sub.productCount,
                status: sub.status,
                parentId: catIndex + 1
              })),
              expanded: false
            };
          }
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error('Failed to fetch category by subcategory ID:', error);
    return undefined;
  }
};