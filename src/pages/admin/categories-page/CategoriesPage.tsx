"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search, Filter, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { categoryApi } from "../../../utils/api"

// Backend category structure
interface BackendSubcategory {
  _id: string
  name: string
  productCount: number
  status: 'Active' | 'Inactive'
  parentId: string
}

interface BackendCategory {
  _id: string
  name: string
  productCount: number
  status: 'Active' | 'Inactive'
  subcategories: BackendSubcategory[]
  createdAt?: string
  updatedAt?: string
  expanded?: boolean // Frontend-only property
}

// Define the form state types
type FormMode = "add" | "edit" | "delete"
type ItemType = "category" | "subcategory"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<BackendCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("add")
  const [itemType, setItemType] = useState<ItemType>("category")
  const [selectedItem, setSelectedItem] = useState<BackendCategory | BackendSubcategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    status: "Active" as "Active" | "Inactive",
    parentId: null as string | null
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset success/error messages after a delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoryApi.getAll()
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const categoriesData = Array.isArray(response.data) ? response.data : []
        // Add expanded property for UI
        setCategories(categoriesData.map((cat: BackendCategory) => ({ ...cat, expanded: false })))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, expanded: !cat.expanded }
          : cat
      )
    )
  }

  const openDialog = (mode: FormMode, type: ItemType, item: BackendCategory | BackendSubcategory | null = null, parentId: string | null = null) => {
    setFormMode(mode)
    setItemType(type)
    setSelectedItem(item)
    
    if (mode === "edit" && item) {
      setFormData({
        name: item.name,
        status: item.status,
        parentId: 'parentId' in item ? item.parentId : null
      })
    } else if (mode === "add" && type === "subcategory" && parentId) {
      setFormData({
        name: "",
        status: "Active",
        parentId
      })
    } else {
      setFormData({
        name: "",
        status: "Active",
        parentId: null
      })
    }
    
    setIsDialogOpen(true)
    setError(null)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedItem(null)
    setFormData({
      name: "",
      status: "Active",
      parentId: null
    })
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Category name is required")
      return false
    }
    
    // Check for duplicate names within the same level
    if (formMode === "add") {
      if (formData.parentId) {
        // Adding subcategory
        const parentCategory = categories.find(cat => cat._id === formData.parentId)
        if (parentCategory) {
          const duplicate = parentCategory.subcategories.find(
            sub => sub.name.toLowerCase() === formData.name.trim().toLowerCase()
          )
          if (duplicate) {
            setError("A subcategory with this name already exists in this category")
            return false
          }
        }
      } else {
        // Adding main category
        const duplicate = categories.find(
          cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase()
        )
        if (duplicate) {
          setError("A category with this name already exists")
          return false
        }
      }
    } else if (formMode === "edit" && selectedItem) {
      // Editing - check if name changed and is duplicate
      if (formData.name.trim() !== selectedItem.name) {
        if ('parentId' in selectedItem) {
          // Editing subcategory
          const parentCategory = categories.find(cat => cat._id === formData.parentId)
          if (parentCategory) {
            const duplicate = parentCategory.subcategories.find(
              sub => sub._id !== selectedItem._id && sub.name.toLowerCase() === formData.name.trim().toLowerCase()
            )
            if (duplicate) {
              setError("A subcategory with this name already exists in this category")
              return false
            }
          }
        } else {
          // Editing main category
          const duplicate = categories.find(
            cat => cat._id !== selectedItem._id && cat.name.toLowerCase() === formData.name.trim().toLowerCase()
          )
          if (duplicate) {
            setError("A category with this name already exists")
            return false
          }
        }
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    try {
      setError(null)
      
      if (formMode === "add") {
        if (formData.parentId) {
          // Adding subcategory
          const response = await categoryApi.addSubcategory(formData.parentId, {
            name: formData.name.trim(),
            status: formData.status,
            productCount: 0
          })
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Subcategory added successfully!")
        } else {
          // Adding main category
          const response = await categoryApi.create({
            name: formData.name.trim(),
            status: formData.status,
            productCount: 0,
            subcategories: []
          })
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Category added successfully!")
        }
      } else if (formMode === "edit" && selectedItem) {
        if ('parentId' in selectedItem) {
          // Editing subcategory
          const response = await categoryApi.updateSubcategory(
            selectedItem.parentId,
            selectedItem._id,
            {
              name: formData.name.trim(),
              status: formData.status
            }
          )
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Subcategory updated successfully!")
        } else {
          // Editing main category
          const response = await categoryApi.update(selectedItem._id, {
            name: formData.name.trim(),
            status: formData.status
          })
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Category updated successfully!")
        }
      } else if (formMode === "delete" && selectedItem) {
        if ('parentId' in selectedItem) {
          // Deleting subcategory
          const response = await categoryApi.deleteSubcategory(
            selectedItem.parentId,
            selectedItem._id
          )
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Subcategory deleted successfully!")
        } else {
          // Deleting main category
          const response = await categoryApi.delete(selectedItem._id)
          if (response.error) {
            setError(response.error)
            return
          }
          setSuccess("Category deleted successfully!")
        }
      }

      // Refresh categories after any operation
      await fetchCategories()
      closeDialog()
    } catch (err: any) {
      setError(err.message || 'Operation failed')
    }
  }

  const handleDelete = (item: BackendCategory | BackendSubcategory) => {
    setSelectedItem(item)
    setFormMode("delete")
    setIsDialogOpen(true)
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchTerm || (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    const matchesFilter = filterStatus === "All" || category.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getTotalProducts = () => {
    return categories.reduce((total, cat) => total + cat.productCount, 0)
  }

  const getActiveCategories = () => {
    return categories.filter(cat => cat.status === "Active").length
  }

  const getStatusBadge = (status: "Active" | "Inactive") => {
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${
        status === "Active" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {status}
      </span>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
          <p className="text-muted-foreground mt-2">Manage product categories and subcategories</p>
        </div>
        <Button 
          onClick={() => openDialog("add", "category")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={20} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Loading categories...</span>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center p-4 bg-green-100 text-green-800 rounded-lg">
          <CheckCircle className="mr-2" size={20} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center p-4 bg-red-100 text-red-800 rounded-lg">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getActiveCategories()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalProducts()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "All" | "Active" | "Inactive")}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No categories found. {searchTerm && "Try adjusting your search or filter."}</p>
            <Button 
              onClick={() => openDialog("add", "category")}
              className="mt-4"
            >
              <Plus size={16} className="mr-2" />
              Add Your First Category
            </Button>
          </Card>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category._id} className="overflow-hidden">
              <div className="p-6">
                {/* Main Category */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="p-1 hover:bg-muted rounded"
                      disabled={category.subcategories.length === 0}
                    >
                      {category.subcategories.length > 0 ? (
                        category.expanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.productCount} products • {category.subcategories.length} subcategories
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(category.status)}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog("add", "subcategory", null, category._id)}
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog("edit", "category", category)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {category.expanded && category.subcategories.length > 0 && (
                  <div className="mt-4 ml-0 md:ml-8 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory._id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">{subcategory.name}</h4>
                          <p className="text-sm text-muted-foreground">{subcategory.productCount} products</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {getStatusBadge(subcategory.status)}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog("edit", "subcategory", subcategory)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subcategory)}
                            >
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) closeDialog()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" && itemType === "category" && "Add Category"}
              {formMode === "add" && itemType === "subcategory" && "Add Subcategory"}
              {formMode === "edit" && itemType === "category" && "Edit Category"}
              {formMode === "edit" && itemType === "subcategory" && "Edit Subcategory"}
              {formMode === "delete" && "Delete Confirmation"}
            </DialogTitle>
          </DialogHeader>
          
              {formMode === "delete" ? (
            <div className="space-y-4">
              <p>Are you sure you want to delete "<strong>{selectedItem?.name}</strong>"?</p>
              {selectedItem && !('parentId' in selectedItem) && (selectedItem as BackendCategory).subcategories.length > 0 && (
                <p className="text-sm text-destructive">
                  This will also delete all {(selectedItem as BackendCategory).subcategories.length} subcategories.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">
                  {itemType === "category" ? "Category Name" : "Subcategory Name"}
                </Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${itemType} name`}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              {itemType === "subcategory" && formData.parentId && (
                <div>
                  <Label>Parent Category</Label>
                  <p className="text-sm text-muted-foreground">
                    {categories.find(cat => cat._id === formData.parentId)?.name}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button 
              variant={formMode === "delete" ? "destructive" : "default"}
              onClick={handleSubmit}
            >
              {formMode === "add" && "Add"}
              {formMode === "edit" && "Save Changes"}
              {formMode === "delete" && "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}