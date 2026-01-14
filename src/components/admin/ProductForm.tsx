import { useState } from "react"
import { X, Image, Video, Edit } from "lucide-react"
import { CategorySelect } from "../CategorySelect"

interface ProductVariant {
  id: string
  size: string
  color: string
  images: (File | string)[]
  videos: (File | string)[]
  price: number
  stock: number
  styleNumber?: string
  fabric?: string
  customSize?: string
  customColor?: string
}

interface Product {
  id: number
  title: string
  description: string
  category: string
  subcategory?: string
  variants: ProductVariant[]
  status: string
  styleNumber?: string
  fabric?: string
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (product: Product) => void
  onCancel: () => void
  isEditing?: boolean
}

const sizes = [
  { id: "xs", name: "XS" },
  { id: "s", name: "S" },
  { id: "m", name: "M" },
  { id: "l", name: "L" },
  { id: "xl", name: "XL" },
  { id: "xxl", name: "XXL" },
  { id: "free", name: "Free Size" },
  { id: "custom", name: "Custom Size" }
]

const colors = [
  { id: "red", name: "Red", hex: "#EF4444" },
  { id: "blue", name: "Blue", hex: "#3B82F6" },
  { id: "green", name: "Green", hex: "#10B981" },
  { id: "black", name: "Black", hex: "#000000" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "yellow", name: "Yellow", hex: "#FBBF24" },
  { id: "pink", name: "Pink", hex: "#EC4899" },
  { id: "purple", name: "Purple", hex: "#8B5CF6" },
  { id: "orange", name: "Orange", hex: "#F97316" },
  { id: "brown", name: "Brown", hex: "#92400E" },
  { id: "custom", name: "Custom Color" }
]

export const ProductForm = ({ initialData, onSubmit, onCancel, isEditing = false }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    subcategory: initialData?.subcategory || "",
    variants: initialData?.variants || [] as ProductVariant[],
    styleNumber: initialData?.styleNumber || "",
    fabric: initialData?.fabric || ""
  })
  
  const [currentVariant, setCurrentVariant] = useState({
    size: "",
    customSize: "",
    color: "",
    customColor: "",
    images: [] as (File | string)[],
    videos: [] as (File | string)[],
    price: 0,
    stock: 0,
    styleNumber: "",
    fabric: ""
  })

  // State for editing existing variants
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Helper function to get file name for display
  const getFileName = (file: File | string): string => {
    if (typeof file === 'string') {
      // For string URLs, extract the filename
      return file.split('/').pop() || file
    }
    return file.name
  }

  // Create a combined list of media for display and reordering
  const getCombinedMediaList = () => {
    const combined: { file: File | string; type: 'image' | 'video'; originalIndex: number; originalType: 'images' | 'videos' }[] = []
    
    // Add images
    currentVariant.images.forEach((file, index) => {
      combined.push({
        file,
        type: 'image',
        originalIndex: index,
        originalType: 'images'
      })
    })
    
    // Add videos
    currentVariant.videos.forEach((file, index) => {
      combined.push({
        file,
        type: 'video',
        originalIndex: index,
        originalType: 'videos'
      })
    })
    
    return combined
  }

  // Drag and drop handlers for current variant media (combined)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    if (sourceIndex !== targetIndex) {
      // Get current combined media list
      const combinedMedia = getCombinedMediaList();
      
      // Reorder the combined list
      const [movedItem] = combinedMedia.splice(sourceIndex, 1);
      combinedMedia.splice(targetIndex, 0, movedItem);
      
      // Rebuild images and videos arrays based on new order
      const newImages: (File | string)[] = []
      const newVideos: (File | string)[] = []
      
      combinedMedia.forEach(item => {
        if (item.originalType === 'images') {
          newImages.push(item.file);
        } else {
          newVideos.push(item.file);
        }
      });
      
      setCurrentVariant(prev => ({
        ...prev,
        images: newImages,
        videos: newVideos
      }));
    }
  }

  // Updated remove media function for combined list
  const removeMediaFromCombinedList = (combinedIndex: number) => {
    const combinedMedia = getCombinedMediaList();
    const mediaItem = combinedMedia[combinedIndex];
    
    if (mediaItem.originalType === 'images') {
      setCurrentVariant(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== mediaItem.originalIndex)
      }))
    } else {
      setCurrentVariant(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== mediaItem.originalIndex)
      }))
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setCurrentVariant(prev => ({ 
      ...prev, 
      images: [...prev.images, ...files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))],
      videos: [...prev.videos, ...files.filter(f => f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|avi|mkv|webm)$/i))]
    }))
  }

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((v: ProductVariant) => v.id !== id)
    }))
  }

  // Function to add a new variant
  const addVariant = () => {
    // Validate required fields
    if (!currentVariant.size || !currentVariant.color) {
      alert("Please select both size and color")
      return
    }
    
    // Get the actual size and color names from the selected IDs
    const selectedSize = sizes.find(s => s.id === currentVariant.size);
    const selectedColor = colors.find(c => c.id === currentVariant.color);
    
    // Handle custom size/color
    const sizeValue = currentVariant.size === "custom" 
      ? currentVariant.customSize 
      : selectedSize?.name || currentVariant.size;
      
    const colorValue = currentVariant.color === "custom"
      ? currentVariant.customColor
      : selectedColor?.name || currentVariant.color;
    
    if ((currentVariant.size === "custom" && !currentVariant.customSize) || 
        (currentVariant.color === "custom" && !currentVariant.customColor)) {
      alert("Please enter custom size/color values")
      return
    }
    
    // Validate price and stock
    if (currentVariant.price <= 0) {
      alert("Please enter a valid price")
      return
    }
    
    if (currentVariant.stock < 0) {
      alert("Please enter a valid stock quantity")
      return
    }
    
    const variant: ProductVariant = {
      id: Date.now().toString(),
      size: sizeValue,
      color: colorValue,
      images: [...currentVariant.images],
      videos: [...currentVariant.videos],
      price: currentVariant.price,
      stock: currentVariant.stock,
      styleNumber: currentVariant.styleNumber,
      fabric: currentVariant.fabric,
      customSize: currentVariant.size === "custom" ? currentVariant.customSize : undefined,
      customColor: currentVariant.color === "custom" ? currentVariant.customColor : undefined
    }
    
    console.log('Adding variant:', variant);
    
    setFormData(prev => ({ ...prev, variants: [...prev.variants, variant] }))
    setCurrentVariant({ 
      size: "", 
      customSize: "", 
      color: "", 
      customColor: "",
      images: [], 
      videos: [], 
      price: 0, 
      stock: 0,
      styleNumber: "",
      fabric: ""
    })
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.category || formData.variants.length === 0) {
      alert("Please fill in all required fields and add at least one variant")
      return
    }
    
    const product: Product = {
      id: initialData?.id || Date.now(),
      ...formData,
      status: initialData?.status || "Active"
    }
    
    onSubmit(product)
  }

  // Function to start editing a variant
  const startEditingVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    
    // Determine if the size and color are custom
    const isCustomSize = !sizes.some(s => s.name === variant.size);
    const isCustomColor = !colors.some(c => c.name === variant.color);
    
    setEditingVariant({
      ...variant,
      customSize: isCustomSize ? variant.size : "",
      customColor: isCustomColor ? variant.color : "",
      // Ensure images and videos arrays are initialized
      images: variant.images || [],
      videos: variant.videos || []
    });
  };

  // Function to cancel editing a variant
  const cancelEditingVariant = () => {
    setEditingVariantId(null);
    setEditingVariant(null);
  };

  // Function to save edited variant
  const saveEditedVariant = () => {
    if (!editingVariant) return;
    
    // Handle custom size/color
    const sizeValue = editingVariant.size === "custom" 
      ? editingVariant.customSize 
      : editingVariant.size;
      
    const colorValue = editingVariant.color === "custom"
      ? editingVariant.customColor
      : editingVariant.color;
    
    const updatedVariant = {
      ...editingVariant,
      size: sizeValue || editingVariant.size,
      color: colorValue || editingVariant.color,
      // Explicitly preserve images and videos arrays
      images: editingVariant.images || [],
      videos: editingVariant.videos || []
    };
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === editingVariant.id ? updatedVariant : v
      )
    }));
    
    setEditingVariantId(null);
    setEditingVariant(null);
  };

  // Function to handle media upload for editing variant
  const handleEditVariantMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingVariant) return;
    
    const files = Array.from(e.target.files || []);
    const newImages = [...editingVariant.images, ...files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))];
    const newVideos = [...editingVariant.videos, ...files.filter(f => f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|avi|mkv|webm)$/i))];
    
    setEditingVariant({
      ...editingVariant,
      images: newImages,
      videos: newVideos
    });
  };

  // Function to remove media from editing variant
  // const removeMediaFromEditingVariant = (type: 'images' | 'videos', index: number) => {
  //   if (!editingVariant) return;
  //   
  //   if (type === 'images') {
  //     const newImages = [...editingVariant.images];
  //     newImages.splice(index, 1);
  //     setEditingVariant({
  //       ...editingVariant,
  //       images: newImages
  //     });
  //   } else {
  //     const newVideos = [...editingVariant.videos];
  //     newVideos.splice(index, 1);
  //     setEditingVariant({
  //       ...editingVariant,
  //       videos: newVideos
  //     });
  //   }
  // };

  // Create a combined list of media for display and reordering for editing variant
  const getEditingVariantCombinedMediaList = () => {
    if (!editingVariant) return [];
    
    const combined: { file: File | string; type: 'image' | 'video'; originalIndex: number; originalType: 'images' | 'videos' }[] = []
    
    // Add images
    editingVariant.images.forEach((file, index) => {
      combined.push({
        file,
        type: 'image',
        originalIndex: index,
        originalType: 'images'
      })
    })
    
    // Add videos
    editingVariant.videos.forEach((file, index) => {
      combined.push({
        file,
        type: 'video',
        originalIndex: index,
        originalType: 'videos'
      })
    })
    
    return combined
  }

  // Drag and drop handlers for editing variant media (combined)
  const handleEditVariantDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  }

  const handleEditVariantDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const handleEditVariantDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (!editingVariant) return;
    
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const combinedMedia = getEditingVariantCombinedMediaList();
    
    if (sourceIndex !== targetIndex) {
      // Reorder the combined list
      const [movedItem] = combinedMedia.splice(sourceIndex, 1);
      combinedMedia.splice(targetIndex, 0, movedItem);
      
      // Rebuild images and videos arrays based on new order
      const newImages: (File | string)[] = []
      const newVideos: (File | string)[] = []
      
      combinedMedia.forEach(item => {
        if (item.originalType === 'images') {
          newImages.push(item.file);
        } else {
          newVideos.push(item.file);
        }
      });
      
      setEditingVariant({
        ...editingVariant,
        images: newImages,
        videos: newVideos
      });
    }
  }

  // Updated remove media function for editing variant combined list
  const removeMediaFromEditingVariantCombinedList = (combinedIndex: number) => {
    if (!editingVariant) return;
    
    const combinedMedia = getEditingVariantCombinedMediaList();
    const mediaItem = combinedMedia[combinedIndex];
    
    if (mediaItem.originalType === 'images') {
      const newImages = [...editingVariant.images];
      newImages.splice(mediaItem.originalIndex, 1);
      setEditingVariant({
        ...editingVariant,
        images: newImages
      });
    } else {
      const newVideos = [...editingVariant.videos];
      newVideos.splice(mediaItem.originalIndex, 1);
      setEditingVariant({
        ...editingVariant,
        videos: newVideos
      });
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h2>
        <button onClick={onCancel}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <CategorySelect
              selectedCategory={formData.category}
              selectedSubcategory={formData.subcategory}
              onCategoryChange={(category, subcategory) => 
                setFormData(prev => ({ 
                  ...prev, 
                  category, 
                  subcategory: subcategory || "" 
                }))
              }
              showSubcategories={true}
              placeholder="Select Product Category"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Style Number</label>
            <input
              type="text"
              value={formData.styleNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, styleNumber: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter style number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fabric</label>
            <input
              type="text"
              value={formData.fabric}
              onChange={(e) => setFormData(prev => ({ ...prev, fabric: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter fabric type"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded-lg h-24"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Add Variant</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select
                value={currentVariant.size}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, size: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Size</option>
                {sizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
              {currentVariant.size === "custom" && (
                <input
                  type="text"
                  value={currentVariant.customSize}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, customSize: e.target.value }))}
                  placeholder="Enter custom size"
                  className="w-full p-2 border rounded-lg mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <select
                value={currentVariant.color}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, color: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Color</option>
                {colors.map(color => (
                  <option key={color.id} value={color.id}>{color.name}</option>
                ))}
              </select>
              {currentVariant.color === "custom" && (
                <input
                  type="text"
                  value={currentVariant.customColor}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, customColor: e.target.value }))}
                  placeholder="Enter custom color"
                  className="w-full p-2 border rounded-lg mt-2"
                />
              )}
              {currentVariant.color && currentVariant.color !== "custom" && (
                <div className="flex items-center mt-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ 
                      backgroundColor: colors.find(c => c.id === currentVariant.color)?.hex || "#CCCCCC",
                      border: currentVariant.color === "white" ? "1px solid #CCCCCC" : "none"
                    }}
                  ></div>
                  <span className="ml-2 text-sm">
                    {colors.find(c => c.id === currentVariant.color)?.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                value={currentVariant.price}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                value={currentVariant.stock}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Combined Media Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Image size={16} />
                <Video size={16} />
                Upload Media (Images & Videos)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="w-full p-2 border rounded-lg"
              />
              {(currentVariant.images.length > 0 || currentVariant.videos.length > 0) && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">
                    {currentVariant.images.length + currentVariant.videos.length} media file(s) selected (Drag to reorder)
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {/* Combined Media List */}
                    {getCombinedMediaList().map((mediaItem, index) => (
                      <div 
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-move hover:bg-gray-200 transition-colors"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {mediaItem.type === 'image' ? (
                            <Image size={16} className="text-blue-500 mr-2 flex-shrink-0" />
                          ) : (
                            <Video size={16} className="text-purple-500 mr-2 flex-shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs truncate flex-1">{getFileName(mediaItem.file)}</span>
                            <span className="text-xs text-gray-500">
                              {index === 0 ? `Primary ${mediaItem.type}` : `${mediaItem.type} #${index + 1}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-gray-400 mr-2">⋮⋮</div>
                          <button
                            type="button"
                            onClick={() => removeMediaFromCombinedList(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={addVariant}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Variant
          </button>
        </div>

        {formData.variants.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
            <div className="space-y-3">
              {formData.variants.map((variant: ProductVariant) => (
                <div key={variant.id} className="p-4 bg-gray-50 rounded-lg border">
                  {editingVariantId === variant.id ? (
                    // Edit variant form - similar to add variant form
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Edit Variant</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Size</label>
                          <select
                            value={editingVariant?.size || ""}
                            onChange={(e) => editingVariant && setEditingVariant({
                              ...editingVariant, 
                              size: e.target.value,
                              customSize: e.target.value === "custom" ? editingVariant.customSize : ""
                            })}
                            className="w-full p-2 border rounded-lg"
                          >
                            <option value="">Select Size</option>
                            {sizes.map(size => (
                              <option key={size.id} value={size.name}>{size.name}</option>
                            ))}
                            <option value="custom">Custom Size</option>
                          </select>
                          {editingVariant?.size === "custom" && (
                            <input
                              type="text"
                              value={editingVariant.customSize || ""}
                              onChange={(e) => editingVariant && setEditingVariant({
                                ...editingVariant, 
                                customSize: e.target.value,
                                size: e.target.value
                              })}
                              placeholder="Enter custom size"
                              className="w-full p-2 border rounded-lg mt-2"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Color</label>
                          <select
                            value={editingVariant?.color || ""}
                            onChange={(e) => editingVariant && setEditingVariant({
                              ...editingVariant, 
                              color: e.target.value,
                              customColor: e.target.value === "custom" ? editingVariant.customColor : ""
                            })}
                            className="w-full p-2 border rounded-lg"
                          >
                            <option value="">Select Color</option>
                            {colors.map(color => (
                              <option key={color.id} value={color.name}>{color.name}</option>
                            ))}
                            <option value="custom">Custom Color</option>
                          </select>
                          {editingVariant?.color === "custom" && (
                            <input
                              type="text"
                              value={editingVariant.customColor || ""}
                              onChange={(e) => editingVariant && setEditingVariant({
                                ...editingVariant, 
                                customColor: e.target.value,
                                color: e.target.value
                              })}
                              placeholder="Enter custom color"
                              className="w-full p-2 border rounded-lg mt-2"
                            />
                          )}
                          {editingVariant?.color && editingVariant.color !== "custom" && (
                            <div className="flex items-center mt-2">
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ 
                                  backgroundColor: colors.find(c => c.name === editingVariant.color)?.hex || "#CCCCCC",
                                  border: editingVariant.color === "White" ? "1px solid #CCCCCC" : "none"
                                }}
                              ></div>
                              <span className="ml-2 text-sm">
                                {colors.find(c => c.name === editingVariant.color)?.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Price (₹)</label>
                          <input
                            type="number"
                            value={editingVariant?.price || 0}
                            onChange={(e) => editingVariant && setEditingVariant({...editingVariant, price: Number(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Stock</label>
                          <input
                            type="number"
                            value={editingVariant?.stock || 0}
                            onChange={(e) => editingVariant && setEditingVariant({...editingVariant, stock: Number(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Style Number</label>
                          <input
                            type="text"
                            value={editingVariant?.styleNumber || ""}
                            onChange={(e) => editingVariant && setEditingVariant({...editingVariant, styleNumber: e.target.value})}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Enter style number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fabric</label>
                          <input
                            type="text"
                            value={editingVariant?.fabric || ""}
                            onChange={(e) => editingVariant && setEditingVariant({...editingVariant, fabric: e.target.value})}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Enter fabric type"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {/* Media Upload for Editing Variant */}
                        <div>
                          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Image size={16} />
                            <Video size={16} />
                            Upload Media (Images & Videos)
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleEditVariantMediaUpload}
                            className="w-full p-2 border rounded-lg"
                          />
                          {(editingVariant?.images.length || 0) > 0 || (editingVariant?.videos.length || 0) > 0 ? (
                            <div className="mt-2">
                              <div className="text-sm text-gray-600 mb-2">
                                {(editingVariant?.images.length || 0) + (editingVariant?.videos.length || 0)} media file(s) selected (Drag to reorder)
                              </div>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {/* Combined Media List for Editing Variant */}
                                {getEditingVariantCombinedMediaList().map((mediaItem, index) => (
                                  <div 
                                    key={index}
                                    draggable
                                    onDragStart={(e) => handleEditVariantDragStart(e, index)}
                                    onDragOver={handleEditVariantDragOver}
                                    onDrop={(e) => handleEditVariantDrop(e, index)}
                                    className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-move hover:bg-gray-200 transition-colors"
                                  >
                                    <div className="flex items-center flex-1 min-w-0">
                                      {mediaItem.type === 'image' ? (
                                        <Image size={16} className="text-blue-500 mr-2 flex-shrink-0" />
                                      ) : (
                                        <Video size={16} className="text-purple-500 mr-2 flex-shrink-0" />
                                      )}
                                      <div className="flex flex-col">
                                        <span className="text-xs truncate flex-1">{getFileName(mediaItem.file)}</span>
                                        <span className="text-xs text-gray-500">
                                          {index === 0 ? `Primary ${mediaItem.type}` : `${mediaItem.type} #${index + 1}`}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="text-gray-400 mr-2">⋮⋮</div>
                                      <button
                                        type="button"
                                        onClick={() => removeMediaFromEditingVariantCombinedList(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEditedVariant}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEditingVariant}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display variant info
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium w-20">Size:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{variant.size}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Color:</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">{variant.color}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Price:</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">₹{variant.price}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Stock:</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{variant.stock}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingVariant(variant)}
                          className="text-blue-500 hover:text-blue-700 p-2"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            {isEditing ? "Update Product" : "Save Product"}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}