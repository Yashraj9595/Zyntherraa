"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Plus, Edit2, Trash2, X, Upload, Loader2, ArrowUp, ArrowDown, Eye, EyeOff, Search, GripVertical, BarChart3, ExternalLink } from "lucide-react"
import { homepageApi, productApi, uploadApi, categoryApi } from "../../utils/api"
import { getImageUrl } from "../../utils/imageUtils"

interface Banner {
  _id: string
  title: string
  subtitle?: string
  image: string
  mobileImage?: string
  buttonText?: string
  buttonLink?: string
  order: number
  isActive: boolean
}

interface FeaturedProduct {
  _id: string
  productId: {
    _id: string
    title: string
    variants: Array<{
      images: string[]
  price: number
    }>
  }
  order: number
  isActive: boolean
}

interface Product {
  _id: string
  title: string
  variants: Array<{
    images: string[]
    price: number
  }>
}

interface WatchAndShop {
  _id: string
  title: string
  description?: string
  videoUrl?: string
  imageUrl?: string
  productId: {
    _id: string
    title: string
    variants: Array<{
      images: string[]
      price: number
    }>
  }
  productImage?: string
  productPrice?: number
  order: number
  isActive: boolean
}

interface SectionTitleEditorProps {
  type: 'collections' | 'featured' | 'watch-and-shop' | 'category'
  defaultTitle: string
  defaultSubtitle: string
}

interface AdminCategory {
  _id: string
  name: string
  image?: string
  status: 'Active' | 'Inactive'
}

interface ShopCategoryItemConfig {
  _id: string
  categoryId?: string
  title: string
  subtitle?: string
  image?: string
  link?: string
  order: number
  isActive: boolean
}

interface CollectionConfigItem {
  _id: string
  name: string
  description?: string
  productIds: string[]
  order: number
  isActive: boolean
}

const SectionTitleEditor: React.FC<SectionTitleEditorProps & { 
  onSuccess?: (message: string) => void
  onError?: (message: string) => void 
}> = ({ type, defaultTitle, defaultSubtitle, onSuccess, onError }) => {
  const [title, setTitle] = useState(defaultTitle)
  const [subtitle, setSubtitle] = useState(defaultSubtitle)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sectionId, setSectionId] = useState<string | null>(null)

  useEffect(() => {
    fetchSection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const fetchSection = async () => {
    try {
      setLoading(true)
      const response = await homepageApi.getSectionByType(type, false)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const section = response.data[0]
        setSectionId(section._id)
        setTitle(section.title || defaultTitle)
        setSubtitle(section.subtitle || defaultSubtitle)
        setIsActive(section.isActive ?? true)
      } else {
        setIsActive(true)
      }
    } catch (error) {
      console.error('Failed to fetch section:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (sectionId) {
        await homepageApi.updateSection(sectionId, {
          type,
          title,
          subtitle,
          isActive
        })
      } else {
        const orderMap: Record<string, number> = {
          'collections': 1,
          'featured': 2,
          'watch-and-shop': 3,
          'category': 0
        }
        const response = await homepageApi.createSection({
          type,
          title,
          subtitle,
          order: orderMap[type] ?? 0,
          isActive
        })
        if (response.data && (response.data as any)._id) {
          setSectionId((response.data as any)._id)
        }
      }
      if (onSuccess) {
        onSuccess('Section title updated successfully')
      }
    } catch (error: any) {
      if (onError) {
        onError(error.message || 'Failed to save section title')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Subtitle</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center justify-between border border-input rounded-lg px-3 py-2">
        <div>
          <p className="text-sm font-medium text-foreground">Display Section</p>
          <p className="text-xs text-muted-foreground">Toggle to show/hide this section on the storefront.</p>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
        </label>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || !title}
        size="sm"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save
      </Button>
    </div>
  )
}

const generateTempId = () => `section-item-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

export default function HomePageManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [featured, setFeatured] = useState<FeaturedProduct[]>([])
  const [watchAndShop, setWatchAndShop] = useState<WatchAndShop[]>([])
  const [shopCategories, setShopCategories] = useState<ShopCategoryItemConfig[]>([])
  const [categorySectionId, setCategorySectionId] = useState<string | null>(null)
  const [categorySectionLoading, setCategorySectionLoading] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<AdminCategory[]>([])
  const [collectionsConfig, setCollectionsConfig] = useState<CollectionConfigItem[]>([])
  const [collectionsSectionId, setCollectionsSectionId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Search and filter state
  const [bannerSearch, setBannerSearch] = useState("")
  const [featuredSearch, setFeaturedSearch] = useState("")
  const [watchAndShopSearch, setWatchAndShopSearch] = useState("")
  const [collectionSearch, setCollectionSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [bannerFilter, setBannerFilter] = useState<"all" | "active" | "inactive">("all")
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "active" | "inactive">("all")
  const [watchAndShopFilter, setWatchAndShopFilter] = useState<"all" | "active" | "inactive">("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "active" | "inactive">("all")
  const [collectionFilter, setCollectionFilter] = useState<"all" | "active" | "inactive">("all")
  
  // Drag and drop state
  const [draggedBannerIndex, setDraggedBannerIndex] = useState<number | null>(null)
  const [draggedFeaturedIndex, setDraggedFeaturedIndex] = useState<number | null>(null)
  const [draggedWatchAndShopIndex, setDraggedWatchAndShopIndex] = useState<number | null>(null)
  
  // Banner modal state
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    mobileImage: "",
    buttonText: "",
    buttonLink: "",
    order: 0,
    isActive: true
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false)
  
  // Featured product modal state
  const [showFeaturedModal, setShowFeaturedModal] = useState(false)
  const [editingFeatured, setEditingFeatured] = useState<FeaturedProduct | null>(null)
  const [featuredForm, setFeaturedForm] = useState({
    productId: "",
    order: 0,
    isActive: true
  })
  // Watch & Shop modal state
  const [showWatchAndShopModal, setShowWatchAndShopModal] = useState(false)
  const [editingWatchAndShop, setEditingWatchAndShop] = useState<WatchAndShop | null>(null)
  const [watchAndShopForm, setWatchAndShopForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    imageUrl: "",
    productId: "",
    productImage: "",
    productPrice: "",
    order: 0,
    isActive: true
  })
  const [uploadingWatchImage, setUploadingWatchImage] = useState(false)
  const [uploadingWatchVideo, setUploadingWatchVideo] = useState(false)
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  
  // Shop by Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategoryItem, setEditingCategoryItem] = useState<ShopCategoryItemConfig | null>(null)
  const [categoryItemForm, setCategoryItemForm] = useState({
    _id: "",
    categoryId: "",
    title: "",
    subtitle: "",
    link: "",
    image: "",
    order: 0,
    isActive: true
  })
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [editingCollectionItem, setEditingCollectionItem] = useState<CollectionConfigItem | null>(null)
  const [collectionForm, setCollectionForm] = useState({
    _id: "",
    name: "",
    description: "",
    productIds: [] as string[],
    order: 0,
    isActive: true
  })

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [bannersRes, featuredRes, watchAndShopRes, productsRes, categoriesRes, categorySectionRes, collectionsSectionRes] = await Promise.all([
        homepageApi.getBanners(),
        homepageApi.getFeatured(),
        homepageApi.getWatchAndShop(),
        productApi.getAll({ status: 'Active' }),
        categoryApi.getAll(),
        homepageApi.getSections(undefined, 'category'),
        homepageApi.getSections(undefined, 'collections')
      ])
      
      if (bannersRes.error) {
        setError(bannersRes.error)
      } else {
        setBanners(Array.isArray(bannersRes.data) ? bannersRes.data : [])
      }
      
      if (featuredRes.error) {
        console.error('Failed to fetch featured products:', featuredRes.error)
      } else {
        setFeatured(Array.isArray(featuredRes.data) ? featuredRes.data : [])
      }
      
      if (watchAndShopRes.error) {
        console.error('Failed to fetch watch & shop items:', watchAndShopRes.error)
      } else {
        setWatchAndShop(Array.isArray(watchAndShopRes.data) ? watchAndShopRes.data : [])
      }
      
      if (productsRes.error) {
        console.error('Failed to fetch products:', productsRes.error)
      } else {
        const productsData = (productsRes.data as any)?.products || productsRes.data
        setProducts(Array.isArray(productsData) ? productsData : [])
      }

      if (categoriesRes.error) {
        console.error('Failed to fetch categories:', categoriesRes.error)
      } else {
        const categoryData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : ((categoriesRes.data as any)?.categories || [])
        setAvailableCategories(
          categoryData.filter((cat: any) => cat.status === 'Active')
        )
      }

      if (categorySectionRes.error) {
        console.error('Failed to fetch Shop by Category section:', categorySectionRes.error)
        setShopCategories([])
        setCategorySectionId(null)
      } else if (Array.isArray(categorySectionRes.data) && categorySectionRes.data.length > 0) {
        const section = categorySectionRes.data[0]
        setCategorySectionId(section._id)
        const items = Array.isArray(section.config?.items) ? section.config.items : []
        const normalized = items
          .filter((item: any) => item)
          .map((item: any) => ({
            _id: item._id || generateTempId(),
            categoryId: item.categoryId,
            title: item.title || item.name || 'Category',
            subtitle: item.subtitle,
            image: item.image,
            link: item.link || '#',
            order: item.order ?? 0,
            isActive: item.isActive ?? true
          }))
          .sort((a: ShopCategoryItemConfig, b: ShopCategoryItemConfig) => a.order - b.order)
        setShopCategories(normalized)
      } else {
        setShopCategories([])
        setCategorySectionId(null)
      }

      if (collectionsSectionRes.error) {
        console.error('Failed to fetch Collections section:', collectionsSectionRes.error)
        setCollectionsConfig([])
        setCollectionsSectionId(null)
      } else if (Array.isArray(collectionsSectionRes.data) && collectionsSectionRes.data.length > 0) {
        const section = collectionsSectionRes.data[0]
        setCollectionsSectionId(section._id)
        const items = Array.isArray(section.config?.collections) ? section.config.collections : []
        const normalizedCollections = items
          .filter((item: any) => item)
          .map((item: any) => ({
            _id: item._id || generateTempId(),
            name: item.name || 'Collection',
            description: item.description || '',
            productIds: Array.isArray(item.productIds) ? item.productIds : [],
            order: item.order ?? 0,
            isActive: item.isActive ?? true
          }))
          .sort((a: CollectionConfigItem, b: CollectionConfigItem) => a.order - b.order)
        setCollectionsConfig(normalizedCollections)
      } else {
        setCollectionsConfig([])
        setCollectionsSectionId(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Banner handlers
  const handleImageUpload = async (file: File, isMobile: boolean = false) => {
    try {
      if (isMobile) {
        setUploadingMobileImage(true)
      } else {
        setUploadingImage(true)
      }
      
      const response = await uploadApi.upload(file, 'images')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        const imagePath = (response.data as any).path || (response.data as any).file?.path
        if (isMobile) {
          setBannerForm({ ...bannerForm, mobileImage: imagePath })
      } else {
          setBannerForm({ ...bannerForm, image: imagePath })
        }
        setSuccess('Image uploaded successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setTimeout(() => setError(null), 5000)
    } finally {
      if (isMobile) {
        setUploadingMobileImage(false)
      } else {
        setUploadingImage(false)
      }
    }
  }

  const handleAddBanner = async () => {
    if (!bannerForm.title || !bannerForm.image) {
      setError('Title and image are required')
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setError(null)
      let response
      
      if (editingBanner) {
        response = await homepageApi.updateBanner(editingBanner._id, bannerForm)
      } else {
        response = await homepageApi.createBanner(bannerForm)
      }
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess(editingBanner ? 'Banner updated successfully' : 'Banner added successfully')
      setTimeout(() => setSuccess(null), 3000)
      setShowBannerModal(false)
      resetBannerForm()
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to save banner')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      setError(null)
      const response = await homepageApi.deleteBanner(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess('Banner deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete banner')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleToggleBannerStatus = async (banner: Banner) => {
    try {
      setError(null)
      const response = await homepageApi.updateBanner(banner._id, {
        ...banner,
        isActive: !banner.isActive
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to update banner status')
      setTimeout(() => setError(null), 5000)
    }
  }

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      mobileImage: banner.mobileImage || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      order: banner.order,
      isActive: banner.isActive
    })
    setShowBannerModal(true)
  }

  const resetBannerForm = () => {
    setEditingBanner(null)
    setBannerForm({
      title: "",
      subtitle: "",
      image: "",
      mobileImage: "",
      buttonText: "",
      buttonLink: "",
      order: 0,
      isActive: true
    })
  }

  // Featured product handlers
  const handleAddFeatured = async () => {
    if (!featuredForm.productId) {
      setError('Please select a product')
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setError(null)
      let response
      
      if (editingFeatured) {
        response = await homepageApi.updateFeatured(editingFeatured._id, featuredForm)
      } else {
        // Check if product is already featured
        const alreadyFeatured = featured.find(f => f.productId._id === featuredForm.productId)
        if (alreadyFeatured) {
          setError('This product is already featured')
          setTimeout(() => setError(null), 5000)
          return
        }
        
        response = await homepageApi.createFeatured(featuredForm)
      }
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess(editingFeatured ? 'Featured product updated successfully' : 'Featured product added successfully')
      setTimeout(() => setSuccess(null), 3000)
      setShowFeaturedModal(false)
      resetFeaturedForm()
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to save featured product')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteFeatured = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this featured product?')) {
      return
    }

    try {
      setError(null)
      const response = await homepageApi.deleteFeatured(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess('Featured product removed successfully')
      setTimeout(() => setSuccess(null), 3000)
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to remove featured product')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleToggleFeaturedStatus = async (featuredItem: FeaturedProduct) => {
    try {
      setError(null)
      const response = await homepageApi.updateFeatured(featuredItem._id, {
        ...featuredItem,
        isActive: !featuredItem.isActive
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to update featured product status')
      setTimeout(() => setError(null), 5000)
    }
  }

  const openEditFeatured = (featuredItem: FeaturedProduct) => {
    setEditingFeatured(featuredItem)
    setFeaturedForm({
      productId: featuredItem.productId._id,
      order: featuredItem.order,
      isActive: featuredItem.isActive
    })
    setShowFeaturedModal(true)
  }

  const resetFeaturedForm = () => {
    setEditingFeatured(null)
    setFeaturedForm({
      productId: "",
      order: 0,
      isActive: true
    })
  }

  // Watch & Shop handlers
  const handleImageUploadWatch = async (file: File) => {
    try {
      setUploadingWatchImage(true)
      const response = await uploadApi.upload(file, 'images')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        const imagePath = (response.data as any).path || (response.data as any).file?.path
        setWatchAndShopForm({ ...watchAndShopForm, imageUrl: imagePath })
        setSuccess('Image uploaded successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setTimeout(() => setError(null), 5000)
    } finally {
      setUploadingWatchImage(false)
    }
  }

  const handleVideoUploadWatch = async (file: File) => {
    try {
      setUploadingWatchVideo(true)
      // Check file size (max 100MB for videos)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        throw new Error('Video file size must be less than 100MB')
      }
      
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file')
      }
      
      const response = await uploadApi.upload(file, 'videos')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        const videoPath = (response.data as any).path || (response.data as any).file?.path
        // Store the path directly (not full URL) - it will be converted when needed
        setWatchAndShopForm({ ...watchAndShopForm, videoUrl: videoPath })
        setSuccess('Video uploaded successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
      setTimeout(() => setError(null), 5000)
    } finally {
      setUploadingWatchVideo(false)
    }
  }

  const handleAddWatchAndShop = async () => {
    if (!watchAndShopForm.title || !watchAndShopForm.productId) {
      setError('Title and product are required')
      setTimeout(() => setError(null), 5000)
      return
    }

    if (!watchAndShopForm.videoUrl && !watchAndShopForm.imageUrl) {
      setError('Either video URL or image is required')
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setError(null)
      const formData = {
        ...watchAndShopForm,
        productPrice: watchAndShopForm.productPrice ? parseFloat(watchAndShopForm.productPrice) : undefined
      }
      
      let response
      if (editingWatchAndShop) {
        response = await homepageApi.updateWatchAndShop(editingWatchAndShop._id, formData)
      } else {
        response = await homepageApi.createWatchAndShop(formData)
      }
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess(editingWatchAndShop ? 'Watch & Shop item updated successfully' : 'Watch & Shop item added successfully')
      setTimeout(() => setSuccess(null), 3000)
      setShowWatchAndShopModal(false)
      resetWatchAndShopForm()
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to save Watch & Shop item')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteWatchAndShop = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Watch & Shop item?')) {
      return
    }

    try {
      setError(null)
      const response = await homepageApi.deleteWatchAndShop(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      setSuccess('Watch & Shop item deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete Watch & Shop item')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleToggleWatchAndShopStatus = async (item: WatchAndShop) => {
    try {
      setError(null)
      const response = await homepageApi.updateWatchAndShop(item._id, {
        ...item,
        isActive: !item.isActive
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to update Watch & Shop status')
      setTimeout(() => setError(null), 5000)
    }
  }

  const openEditWatchAndShop = (item: WatchAndShop) => {
    setEditingWatchAndShop(item)
    const product = item.productId
    const firstVariant = product?.variants?.[0]
    setWatchAndShopForm({
      title: item.title,
      description: item.description || "",
      videoUrl: item.videoUrl || "",
      imageUrl: item.imageUrl || "",
      productId: item.productId._id,
      productImage: item.productImage || firstVariant?.images?.[0] || "",
      productPrice: item.productPrice?.toString() || firstVariant?.price?.toString() || "",
      order: item.order,
      isActive: item.isActive
    })
    setShowWatchAndShopModal(true)
  }

  const resetWatchAndShopForm = () => {
    setEditingWatchAndShop(null)
    setWatchAndShopForm({
      title: "",
      description: "",
      videoUrl: "",
      imageUrl: "",
      productId: "",
      productImage: "",
      productPrice: "",
      order: 0,
      isActive: true
    })
  }

  const handleReorderWatchAndShop = async (index: number, direction: "up" | "down") => {
    if (index === 0 && direction === "up") return
    if (index === sortedWatchAndShop.length - 1 && direction === "down") return
    
    const newIndex = direction === "up" ? index - 1 : index + 1
    const item = sortedWatchAndShop[index]
    const targetItem = sortedWatchAndShop[newIndex]
    
    const tempOrder = item.order
    item.order = targetItem.order
    targetItem.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateWatchAndShop(item._id, { order: item.order }),
        homepageApi.updateWatchAndShop(targetItem._id, { order: targetItem.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder Watch & Shop item')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleWatchAndShopDragStart = (e: React.DragEvent, index: number) => {
    setDraggedWatchAndShopIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleWatchAndShopDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleWatchAndShopDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedWatchAndShopIndex === null || draggedWatchAndShopIndex === targetIndex) {
      setDraggedWatchAndShopIndex(null)
      return
    }
    
    const sourceItem = sortedWatchAndShop[draggedWatchAndShopIndex]
    const targetItem = sortedWatchAndShop[targetIndex]
    
    const tempOrder = sourceItem.order
    sourceItem.order = targetItem.order
    targetItem.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateWatchAndShop(sourceItem._id, { order: sourceItem.order }),
        homepageApi.updateWatchAndShop(targetItem._id, { order: targetItem.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder Watch & Shop item')
      setTimeout(() => setError(null), 5000)
    }
    
    setDraggedWatchAndShopIndex(null)
  }

  const getNextCategoryOrder = () => {
    if (shopCategories.length === 0) return 0
    return Math.max(...shopCategories.map((item) => item.order)) + 1
  }

  const resetCategoryItemForm = () => {
    setEditingCategoryItem(null)
    setCategoryItemForm({
      _id: "",
      categoryId: "",
      title: "",
      subtitle: "",
      link: "",
      image: "",
      order: getNextCategoryOrder(),
      isActive: true
    })
  }

  const handleCategorySelect = (categoryId: string) => {
    const selected = availableCategories.find((cat) => cat._id === categoryId)
    if (!selected) {
      setCategoryItemForm((prev) => ({ ...prev, categoryId, link: "", image: prev.image }))
      return
    }
    const slug = selected.name.toLowerCase().replace(/\s+/g, '-')
    setCategoryItemForm((prev) => ({
      ...prev,
      categoryId,
      title: selected.name,
      link: `/category/${slug}`,
      image: selected.image || prev.image
    }))
  }

  const persistShopCategoryItems = async (items: ShopCategoryItemConfig[]) => {
    try {
      setCategorySectionLoading(true)
      if (categorySectionId) {
        await homepageApi.updateSection(categorySectionId, {
          config: { items }
        })
      } else {
        const response = await homepageApi.createSection({
          type: 'category',
          title: 'Shop by Category',
          subtitle: 'Discover our curated collections',
          order: 1,
          isActive: true,
          config: { items }
        })
        if (response.data && (response.data as any)._id) {
          setCategorySectionId((response.data as any)._id)
        }
      }
      setShopCategories(items)
      setSuccess('Shop by Category updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update Shop by Category')
      setTimeout(() => setError(null), 5000)
    } finally {
      setCategorySectionLoading(false)
    }
  }

  const handleSaveCategoryItem = async () => {
    if (!categoryItemForm.title || !categoryItemForm.link || !categoryItemForm.image) {
      setError('Title, link, and image are required')
      setTimeout(() => setError(null), 5000)
      return
    }

    const payload: ShopCategoryItemConfig = {
      ...categoryItemForm,
      _id: editingCategoryItem?._id || categoryItemForm._id || generateTempId(),
      order: typeof categoryItemForm.order === 'number' ? categoryItemForm.order : getNextCategoryOrder()
    }

    const updatedItems = editingCategoryItem
      ? shopCategories.map((item) => (item._id === editingCategoryItem._id ? payload : item))
      : [...shopCategories, payload]

    await persistShopCategoryItems(updatedItems.sort((a, b) => a.order - b.order))
    resetCategoryItemForm()
    setShowCategoryModal(false)
  }

  const handleDeleteCategoryItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this category tile?')) {
      return
    }
    const updatedItems = shopCategories.filter((item) => item._id !== id)
    await persistShopCategoryItems(updatedItems)
  }

  const handleToggleCategoryItem = async (item: ShopCategoryItemConfig) => {
    const updatedItems = shopCategories.map((cat) =>
      cat._id === item._id ? { ...cat, isActive: !cat.isActive } : cat
    )
    await persistShopCategoryItems(updatedItems)
  }

  const handleReorderShopCategory = async (id: string, direction: "up" | "down") => {
    const ordered = [...shopCategories].sort((a, b) => a.order - b.order)
    const index = ordered.findIndex((item) => item._id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === ordered.length - 1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    const tempOrder = ordered[index].order
    ordered[index].order = ordered[targetIndex].order
    ordered[targetIndex].order = tempOrder

    await persistShopCategoryItems(ordered)
  }

  const handleCategoryImageUpload = async (file: File) => {
    try {
      setUploadingCategoryImage(true)
      const response = await uploadApi.upload(file, 'images')
      if (response.error) {
        throw new Error(response.error)
      }
      if (response.data) {
        const imagePath = (response.data as any).path || (response.data as any).file?.path
        setCategoryItemForm((prev) => ({ ...prev, image: imagePath }))
        setSuccess('Image uploaded successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload category image')
      setTimeout(() => setError(null), 5000)
    } finally {
      setUploadingCategoryImage(false)
    }
  }

  const getNextCollectionOrder = () => {
    if (collectionsConfig.length === 0) return 0
    return Math.max(...collectionsConfig.map((item) => item.order)) + 1
  }

  const resetCollectionForm = () => {
    setEditingCollectionItem(null)
    setCollectionForm({
      _id: "",
      name: "",
      description: "",
      productIds: [],
      order: getNextCollectionOrder(),
      isActive: true
    })
  }

  const handleCollectionProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value)
    setCollectionForm({ ...collectionForm, productIds: selected })
  }

  const persistCollectionsConfig = async (items: CollectionConfigItem[]) => {
    try {
      setCollectionsLoading(true)
      if (collectionsSectionId) {
        await homepageApi.updateSection(collectionsSectionId, {
          config: { collections: items }
        })
      } else {
        const response = await homepageApi.createSection({
          type: 'collections',
          title: 'Our Collections',
          subtitle: 'Discover the perfect outfit for every occasion',
          order: 2,
          isActive: true,
          config: { collections: items }
        })
        if (response.data && (response.data as any)._id) {
          setCollectionsSectionId((response.data as any)._id)
        }
      }
      setCollectionsConfig(items)
      setSuccess('Collections updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update collections')
      setTimeout(() => setError(null), 5000)
    } finally {
      setCollectionsLoading(false)
    }
  }

  const handleSaveCollectionItem = async () => {
    if (!collectionForm.name || collectionForm.productIds.length === 0) {
      setError('Collection name and at least one product are required')
      setTimeout(() => setError(null), 5000)
      return
    }

    const payload: CollectionConfigItem = {
      _id: editingCollectionItem?._id || collectionForm._id || generateTempId(),
      name: collectionForm.name,
      description: collectionForm.description || '',
      productIds: collectionForm.productIds,
      order: typeof collectionForm.order === 'number' ? collectionForm.order : getNextCollectionOrder(),
      isActive: collectionForm.isActive
    }

    const updatedItems = editingCollectionItem
      ? collectionsConfig.map((item) => (item._id === editingCollectionItem._id ? payload : item))
      : [...collectionsConfig, payload]

    await persistCollectionsConfig(updatedItems.sort((a, b) => a.order - b.order))
    resetCollectionForm()
    setShowCollectionModal(false)
  }

  const handleDeleteCollectionItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) {
      return
    }
    const updatedItems = collectionsConfig.filter((item) => item._id !== id)
    await persistCollectionsConfig(updatedItems)
  }

  const handleToggleCollectionItem = async (item: CollectionConfigItem) => {
    const updatedItems = collectionsConfig.map((collection) =>
      collection._id === item._id ? { ...collection, isActive: !collection.isActive } : collection
    )
    await persistCollectionsConfig(updatedItems)
  }

  const handleReorderCollectionItem = async (id: string, direction: "up" | "down") => {
    const ordered = [...collectionsConfig].sort((a, b) => a.order - b.order)
    const index = ordered.findIndex((item) => item._id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === ordered.length - 1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    const tempOrder = ordered[index].order
    ordered[index].order = ordered[targetIndex].order
    ordered[targetIndex].order = tempOrder

    await persistCollectionsConfig(ordered)
  }

  // Sort banners by order
  const sortedBanners = [...banners].sort((a, b) => a.order - b.order)
  const sortedFeatured = [...featured].sort((a, b) => a.order - b.order)
  const sortedWatchAndShop = [...watchAndShop].sort((a, b) => a.order - b.order)
  const sortedShopCategories = useMemo(
    () => [...shopCategories].sort((a, b) => a.order - b.order),
    [shopCategories]
  )
  const sortedCollections = useMemo(
    () => [...collectionsConfig].sort((a, b) => a.order - b.order),
    [collectionsConfig]
  )
  
  // Filtered banners
  const filteredBanners = useMemo(() => {
    return sortedBanners.filter(banner => {
      const matchesSearch = bannerSearch === "" || 
        banner.title.toLowerCase().includes(bannerSearch.toLowerCase()) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(bannerSearch.toLowerCase()))
      const matchesFilter = bannerFilter === "all" || 
        (bannerFilter === "active" && banner.isActive) ||
        (bannerFilter === "inactive" && !banner.isActive)
      return matchesSearch && matchesFilter
    })
  }, [sortedBanners, bannerSearch, bannerFilter])
  
  // Filtered featured products
  const filteredFeatured = useMemo(() => {
    return sortedFeatured.filter(item => {
      const product = item.productId
      const matchesSearch = featuredSearch === "" || 
        product?.title?.toLowerCase().includes(featuredSearch.toLowerCase())
      const matchesFilter = featuredFilter === "all" || 
        (featuredFilter === "active" && item.isActive) ||
        (featuredFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesFilter
    })
  }, [sortedFeatured, featuredSearch, featuredFilter])
  
  // Filtered watch & shop
  const filteredWatchAndShop = useMemo(() => {
    return sortedWatchAndShop.filter(item => {
      const product = item.productId
      const matchesSearch = watchAndShopSearch === "" || 
        item.title?.toLowerCase().includes(watchAndShopSearch.toLowerCase()) ||
        product?.title?.toLowerCase().includes(watchAndShopSearch.toLowerCase())
      const matchesFilter = watchAndShopFilter === "all" || 
        (watchAndShopFilter === "active" && item.isActive) ||
        (watchAndShopFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesFilter
    })
  }, [sortedWatchAndShop, watchAndShopSearch, watchAndShopFilter])
  
  const filteredShopCategories = useMemo(() => {
    return sortedShopCategories.filter(item => {
      const matchesSearch = categorySearch === "" ||
        item.title.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (item.subtitle?.toLowerCase().includes(categorySearch.toLowerCase()) ?? false)
      const matchesFilter = categoryFilter === "all" ||
        (categoryFilter === "active" && item.isActive) ||
        (categoryFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesFilter
    })
  }, [sortedShopCategories, categorySearch, categoryFilter])

  const filteredCollections = useMemo(() => {
    return sortedCollections.filter(item => {
      const matchesSearch = collectionSearch === "" ||
        item.name.toLowerCase().includes(collectionSearch.toLowerCase()) ||
        (item.description?.toLowerCase().includes(collectionSearch.toLowerCase()) ?? false)
      const matchesFilter = collectionFilter === "all" ||
        (collectionFilter === "active" && item.isActive) ||
        (collectionFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesFilter
    })
  }, [sortedCollections, collectionSearch, collectionFilter])
  
  // Statistics
  const stats = useMemo(() => {
    return {
      totalBanners: banners.length,
      activeBanners: banners.filter(b => b.isActive).length,
      totalFeatured: featured.length,
      activeFeatured: featured.filter(f => f.isActive).length,
      totalWatchAndShop: watchAndShop.length,
      activeWatchAndShop: watchAndShop.filter(w => w.isActive).length
    }
  }, [banners, featured, watchAndShop])
  
  // Get available products (not already featured, unless editing)
  const availableProducts = useMemo(() => {
    return products.filter(p => {
      if (editingFeatured && p._id === editingFeatured.productId._id) {
        return true // Allow current product when editing
      }
      return !featured.some(f => f.productId._id === p._id && f.isActive)
    })
  }, [products, featured, editingFeatured])
  
  // Reorder handlers
  const handleReorderBanner = async (index: number, direction: "up" | "down") => {
    if (index === 0 && direction === "up") return
    if (index === sortedBanners.length - 1 && direction === "down") return
    
    const newIndex = direction === "up" ? index - 1 : index + 1
    const banner = sortedBanners[index]
    const targetBanner = sortedBanners[newIndex]
    
    // Swap orders
    const tempOrder = banner.order
    banner.order = targetBanner.order
    targetBanner.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateBanner(banner._id, { order: banner.order }),
        homepageApi.updateBanner(targetBanner._id, { order: targetBanner.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder banner')
      setTimeout(() => setError(null), 5000)
    }
  }
  
  const handleReorderFeatured = async (index: number, direction: "up" | "down") => {
    if (index === 0 && direction === "up") return
    if (index === sortedFeatured.length - 1 && direction === "down") return
    
    const newIndex = direction === "up" ? index - 1 : index + 1
    const item = sortedFeatured[index]
    const targetItem = sortedFeatured[newIndex]
    
    // Swap orders
    const tempOrder = item.order
    item.order = targetItem.order
    targetItem.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateFeatured(item._id, { order: item.order }),
        homepageApi.updateFeatured(targetItem._id, { order: targetItem.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder featured product')
      setTimeout(() => setError(null), 5000)
    }
  }
  
  // Drag and drop handlers for banners
  const handleBannerDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBannerIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }
  
  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }
  
  const handleBannerDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedBannerIndex === null || draggedBannerIndex === targetIndex) {
      setDraggedBannerIndex(null)
      return
    }
    
    const sourceBanner = sortedBanners[draggedBannerIndex]
    const targetBanner = sortedBanners[targetIndex]
    
    // Swap orders
    const tempOrder = sourceBanner.order
    sourceBanner.order = targetBanner.order
    targetBanner.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateBanner(sourceBanner._id, { order: sourceBanner.order }),
        homepageApi.updateBanner(targetBanner._id, { order: targetBanner.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder banner')
      setTimeout(() => setError(null), 5000)
    }
    
    setDraggedBannerIndex(null)
  }
  
  // Drag and drop handlers for featured products
  const handleFeaturedDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFeaturedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }
  
  const handleFeaturedDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }
  
  const handleFeaturedDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedFeaturedIndex === null || draggedFeaturedIndex === targetIndex) {
      setDraggedFeaturedIndex(null)
      return
    }
    
    const sourceItem = sortedFeatured[draggedFeaturedIndex]
    const targetItem = sortedFeatured[targetIndex]
    
    // Swap orders
    const tempOrder = sourceItem.order
    sourceItem.order = targetItem.order
    targetItem.order = tempOrder
    
    try {
      await Promise.all([
        homepageApi.updateFeatured(sourceItem._id, { order: sourceItem.order }),
        homepageApi.updateFeatured(targetItem._id, { order: targetItem.order })
      ])
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder featured product')
      setTimeout(() => setError(null), 5000)
    }
    
    setDraggedFeaturedIndex(null)
  }

  if (loading) {
  return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Home Page Management</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Customize your home page banners and featured products
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Shop Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingCategoryItem ? "Edit Category Tile" : "Add Category Tile"}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  resetCategoryItemForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Link Existing Category
                </label>
                <select
                  value={categoryItemForm.categoryId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Custom (no linked category)</option>
                  {availableCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                  <input
                    type="text"
                    value={categoryItemForm.title}
                    onChange={(e) => setCategoryItemForm({ ...categoryItemForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={categoryItemForm.subtitle || ""}
                    onChange={(e) => setCategoryItemForm({ ...categoryItemForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Link *</label>
                <input
                  type="text"
                  value={categoryItemForm.link}
                  onChange={(e) => setCategoryItemForm({ ...categoryItemForm, link: e.target.value })}
                  placeholder="/category/women"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Image *</label>
                <div className="border border-dashed border-input rounded-lg p-4 flex flex-col items-center justify-center text-center bg-muted/30">
                  {categoryItemForm.image ? (
                    <>
                      <img
                        src={getImageUrl(categoryItemForm.image)}
                        alt={categoryItemForm.title || 'Category'}
                        className="w-32 h-32 object-cover rounded-full mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.jpg'
                        }}
                      />
                      <p className="text-xs text-muted-foreground mb-3">
                        Recommended size: 512x512px, square image works best.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload or select an image to represent this category tile.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <label className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
                      {uploadingCategoryImage ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                        </span>
                      ) : (
                        'Upload Image'
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleCategoryImageUpload(file)
                          }
                          e.target.value = ""
                        }}
                      />
                    </label>
                    {categoryItemForm.image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCategoryItemForm({ ...categoryItemForm, image: "" })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={categoryItemForm.order}
                    onChange={(e) =>
                      setCategoryItemForm({
                        ...categoryItemForm,
                        order: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryItemForm.isActive}
                      onChange={(e) =>
                        setCategoryItemForm({ ...categoryItemForm, isActive: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false)
                  resetCategoryItemForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategoryItem}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!categoryItemForm.title || !categoryItemForm.image || !categoryItemForm.link}
              >
                {editingCategoryItem ? "Save Changes" : "Add Tile"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Collections Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingCollectionItem ? "Edit Collection" : "Add Collection"}
              </h2>
              <button
                onClick={() => {
                  setShowCollectionModal(false)
                  resetCollectionForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    value={collectionForm.name}
                    onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={collectionForm.order}
                    onChange={(e) =>
                      setCollectionForm({ ...collectionForm, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Products *</label>
                <select
                  multiple
                  value={collectionForm.productIds}
                  onChange={handleCollectionProductChange}
                  className="w-full min-h-[160px] px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.title} - ₹{product.variants?.[0]?.price?.toLocaleString() || '0'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Hold Ctrl (Windows) or Command (Mac) to select multiple products.
                </p>
                {collectionForm.productIds.length > 0 && (
                  <div className="mt-3 p-3 border border-input rounded-lg bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Selected products:</p>
                    <div className="flex flex-wrap gap-2">
                      {collectionForm.productIds.map((id) => {
                        const product = products.find((p) => p._id === id)
                        if (!product) return null
                        return (
                          <span key={id} className="px-2 py-1 text-xs bg-white rounded-full border border-border">
                            {product.title}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectionForm.isActive}
                    onChange={(e) => setCollectionForm({ ...collectionForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCollectionModal(false)
                  resetCollectionForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCollectionItem}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!collectionForm.name || collectionForm.productIds.length === 0}
              >
                {editingCollectionItem ? "Save Changes" : "Add Collection"}
              </Button>
            </div>
          </Card>
        </div>
      )}


      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Banners</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalBanners}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Banners</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeBanners}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Featured Products</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalFeatured}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Featured</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeFeatured}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Watch & Shop</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalWatchAndShop}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Preview Home Page Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            window.open('/', '_blank')
          }}
          className="flex items-center gap-2"
        >
          <ExternalLink size={16} />
          Preview Home Page
        </Button>
      </div>

      {/* Banner Sections */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Banner Sections</h2>
          <Button
            onClick={() => {
              resetBannerForm()
              setShowBannerModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Banner
          </Button>
        </div>

        {/* Search and Filter for Banners */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search banners..."
              value={bannerSearch}
              onChange={(e) => setBannerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={bannerFilter}
            onChange={(e) => setBannerFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Banners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {filteredBanners.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {sortedBanners.length === 0 
                ? "No banners yet. Add your first banner to get started."
                : "No banners match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredBanners.map((banner, index) => {
              const bannerImage = getImageUrl(banner.image)
              const originalIndex = sortedBanners.findIndex(b => b._id === banner._id)
              return (
                <Card 
                  key={banner._id} 
                  className="overflow-hidden"
                  draggable
                  onDragStart={(e) => handleBannerDragStart(e, originalIndex)}
                  onDragOver={handleBannerDragOver}
                  onDrop={(e) => handleBannerDrop(e, originalIndex)}
                  style={{ 
                    opacity: draggedBannerIndex === originalIndex ? 0.5 : 1,
                    cursor: 'move'
                  }}
                >
                  <div className="flex gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center justify-center p-2 cursor-move bg-muted/50">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderBanner(originalIndex, "up")}
                          disabled={originalIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderBanner(originalIndex, "down")}
                          disabled={originalIndex === sortedBanners.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Banner Content */}
                    <div className="flex-1 flex gap-4">
                      <div className="relative w-32 h-32 bg-muted flex-shrink-0">
                        <img
                          src={bannerImage}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/placeholder.jpg'
                          }}
                />
              </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                  <h3 className="font-bold text-foreground">{banner.title}</h3>
                            {banner.subtitle && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{banner.subtitle}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Order: {banner.order}</span>
                              <span className={`px-2 py-1 rounded ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBannerStatus(banner)}
                            className={`${banner.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
                          >
                            {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                </div>
                <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditBanner(banner)} 
                            className="flex-1"
                          >
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                            onClick={() => handleDeleteBanner(banner._id)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                        </div>
                      </div>
                </div>
              </div>
            </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Shop by Category Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">
              Curate the category tiles that appear on the home page section.
            </p>
          </div>
          <Button
            onClick={() => {
              resetCategoryItemForm()
              setShowCategoryModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Category Tile
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search category tiles..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Tiles</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {categorySectionLoading ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Updating Shop by Category...</p>
            </div>
          </Card>
        ) : filteredShopCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {shopCategories.length === 0
                ? "No category tiles yet. Add tiles to highlight specific categories."
                : "No category tiles match your current filters."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredShopCategories.map((item) => {
              const position = sortedShopCategories.findIndex((cat) => cat._id === item._id)
              const imageSrc = item.image ? getImageUrl(item.image) : '/images/placeholder.jpg'
              return (
                <Card key={item._id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.subtitle}</p>
                      )}
                      <p className="text-xs text-primary break-all">{item.link}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Order: {item.order}</span>
                        {item.categoryId && <span>Linked category</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderShopCategory(item._id, "up")}
                        disabled={position === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderShopCategory(item._id, "down")}
                        disabled={position === sortedShopCategories.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown size={14} />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCategoryItem(item)}
                      className={`${item.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}
                    >
                      {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategoryItem(item)
                        setCategoryItemForm({
                          _id: item._id,
                          categoryId: item.categoryId || "",
                          title: item.title,
                          subtitle: item.subtitle || "",
                          link: item.link || "",
                          image: item.image || "",
                          order: item.order,
                          isActive: item.isActive
                        })
                        setShowCategoryModal(true)
                      }}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategoryItem(item._id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Our Collections Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Our Collections</h2>
            <p className="text-sm text-muted-foreground">
              Curate collection tabs and choose exactly which products appear under each.
            </p>
          </div>
          <Button
            onClick={() => {
              resetCollectionForm()
              setShowCollectionModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Collection
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search collections..."
              value={collectionSearch}
              onChange={(e) => setCollectionSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Collections</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {collectionsLoading ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Updating collections...</p>
            </div>
          </Card>
        ) : filteredCollections.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {collectionsConfig.length === 0
                ? "No collections yet. Add curated groups of products to control this section."
                : "No collections match your filters."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredCollections.map((collection) => {
              const position = sortedCollections.findIndex((c) => c._id === collection._id)
              const selectedProducts = collection.productIds
                .map((id) => products.find((p) => p._id === id))
                .filter((p): p is Product => Boolean(p))
              return (
                <Card key={collection._id} className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{collection.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              collection.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {collection.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Order: {collection.order}</span>
                          <span>{selectedProducts.length} products</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderCollectionItem(collection._id, "up")}
                            disabled={position === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderCollectionItem(collection._id, "down")}
                            disabled={position === sortedCollections.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowDown size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCollectionItem(collection)}
                          className={`${collection.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}
                        >
                          {collection.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCollectionItem(collection)
                            setCollectionForm({
                              _id: collection._id,
                              name: collection.name,
                              description: collection.description || "",
                              productIds: [...collection.productIds],
                              order: collection.order,
                              isActive: collection.isActive
                            })
                            setShowCollectionModal(true)
                          }}
                        >
                          <Edit2 size={16} className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCollectionItem(collection._id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((product) => (
                          <div
                            key={product._id}
                            className="px-3 py-1 rounded-full bg-muted text-xs text-foreground flex items-center gap-2"
                          >
                            <span className="font-medium">{product.title}</span>
                            <span className="text-muted-foreground">
                              ₹{product.variants?.[0]?.price?.toLocaleString() || '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Section Titles Management */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Section Titles & Descriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Shop by Category Section</h3>
            <SectionTitleEditor 
              type="category"
              defaultTitle="Shop by Category"
              defaultSubtitle="Discover our curated collections"
              onSuccess={(msg) => {
                setSuccess(msg)
                setTimeout(() => setSuccess(null), 3000)
              }}
              onError={(msg) => {
                setError(msg)
                setTimeout(() => setError(null), 5000)
              }}
            />
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Our Collections Section</h3>
            <SectionTitleEditor 
              type="collections"
              defaultTitle="Our Collections"
              defaultSubtitle="Discover the perfect outfit for every occasion"
              onSuccess={(msg) => {
                setSuccess(msg)
                setTimeout(() => setSuccess(null), 3000)
              }}
              onError={(msg) => {
                setError(msg)
                setTimeout(() => setError(null), 5000)
              }}
            />
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Featured Products Section</h3>
            <SectionTitleEditor 
              type="featured"
              defaultTitle="Featured Products"
              defaultSubtitle="Handpicked selections just for you"
              onSuccess={(msg) => {
                setSuccess(msg)
                setTimeout(() => setSuccess(null), 3000)
              }}
              onError={(msg) => {
                setError(msg)
                setTimeout(() => setError(null), 5000)
              }}
            />
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Watch & Shop Section</h3>
            <SectionTitleEditor 
              type="watch-and-shop"
              defaultTitle="Watch & Shop"
              defaultSubtitle="Shop directly from our videos and images"
              onSuccess={(msg) => {
                setSuccess(msg)
                setTimeout(() => setSuccess(null), 3000)
              }}
              onError={(msg) => {
                setError(msg)
                setTimeout(() => setError(null), 5000)
              }}
            />
          </Card>
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Featured Products</h2>
          <Button
            onClick={() => {
              resetFeaturedForm()
              setShowFeaturedModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Featured Product
          </Button>
        </div>

        {/* Search and Filter for Featured Products */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search featured products..."
              value={featuredSearch}
              onChange={(e) => setFeaturedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Products</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {filteredFeatured.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {sortedFeatured.length === 0 
                ? "No featured products yet. Add products to showcase on your home page."
                : "No featured products match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredFeatured.map((item, index) => {
              const product = item.productId
              const firstVariant = product?.variants?.[0]
              const productImage = getImageUrl(firstVariant?.images?.[0])
              const productPrice = firstVariant?.price || 0
              const originalIndex = sortedFeatured.findIndex(f => f._id === item._id)
              
              return (
                <Card 
                  key={item._id} 
                  className="overflow-hidden"
                  draggable
                  onDragStart={(e) => handleFeaturedDragStart(e, originalIndex)}
                  onDragOver={handleFeaturedDragOver}
                  onDrop={(e) => handleFeaturedDrop(e, originalIndex)}
                  style={{ 
                    opacity: draggedFeaturedIndex === originalIndex ? 0.5 : 1,
                    cursor: 'move'
                  }}
                >
                  <div className="flex gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center justify-center p-2 cursor-move bg-muted/50">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderFeatured(originalIndex, "up")}
                          disabled={originalIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderFeatured(originalIndex, "down")}
                          disabled={originalIndex === sortedFeatured.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Product Content */}
                    <div className="flex-1 flex gap-4">
                      <div className="relative w-32 h-32 bg-muted flex-shrink-0">
                        <img
                          src={productImage}
                          alt={product?.title || 'Product'}
                  className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/placeholder.jpg'
                          }}
                />
              </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{product?.title || 'Unknown Product'}</h3>
                            <p className="text-lg font-semibold text-primary">₹{productPrice.toLocaleString()}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Order: {item.order}</span>
                              <span className={`px-2 py-1 rounded ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeaturedStatus(item)}
                            className={`${item.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
                          >
                            {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                </div>
                <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditFeatured(item)} 
                            className="flex-1"
                          >
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                            onClick={() => handleDeleteFeatured(item._id)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" />
                            Remove
                  </Button>
                        </div>
                      </div>
                </div>
              </div>
            </Card>
              )
            })}
        </div>
        )}
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingBanner ? "Edit Banner" : "Add Banner"}
              </h2>
              <button 
                onClick={() => {
                  setShowBannerModal(false)
                  resetBannerForm()
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
              <input
                type="text"
                placeholder="Banner Title"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
              <input
                type="text"
                placeholder="Subtitle"
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Desktop Image *</label>
                <div className="flex gap-2">
              <input
                type="text"
                    placeholder="Image URL or upload file"
                value={bannerForm.image}
                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent cursor-pointer flex items-center gap-2">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, false)
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {bannerForm.image && (
                  <img 
                    src={getImageUrl(bannerForm.image)} 
                    alt="Preview" 
                    className="mt-2 h-32 w-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder.jpg'
                    }}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mobile Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mobile Image URL or upload file"
                    value={bannerForm.mobileImage}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent cursor-pointer flex items-center gap-2">
                    {uploadingMobileImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, true)
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {bannerForm.mobileImage && (
                  <img 
                    src={getImageUrl(bannerForm.mobileImage)} 
                    alt="Mobile Preview" 
                    className="mt-2 h-32 w-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder.jpg'
                    }}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Button Text</label>
              <input
                type="text"
                placeholder="Button Text"
                value={bannerForm.buttonText}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Button Link</label>
              <input
                type="text"
                  placeholder="Button Link (e.g., /shop)"
                value={bannerForm.buttonLink}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerForm.isActive}
                      onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBannerModal(false)
                  resetBannerForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddBanner} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!bannerForm.title || !bannerForm.image}
              >
                {editingBanner ? "Save Changes" : "Add Banner"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Featured Product Modal */}
      {showFeaturedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingFeatured ? "Edit Featured Product" : "Add Featured Product"}
              </h2>
              <button
                onClick={() => {
                  setShowFeaturedModal(false)
                  resetFeaturedForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                <select
                  value={featuredForm.productId}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, productId: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a product</option>
                  {availableProducts.map((product) => {
                    const firstVariant = product.variants?.[0]
                    const productPrice = firstVariant?.price || 0
                    return (
                      <option key={product._id} value={product._id}>
                        {product.title} - ₹{productPrice.toLocaleString()}
                      </option>
                    )
                  })}
                </select>
                {availableProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No available products. All products are already featured.
                  </p>
                )}
                {featuredForm.productId && availableProducts.find(p => p._id === featuredForm.productId) && (
                  <div className="mt-2 p-2 border border-input rounded-lg bg-muted/50">
                    <p className="text-sm font-medium text-foreground">
                      Selected: {availableProducts.find(p => p._id === featuredForm.productId)?.title}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={featuredForm.order}
                    onChange={(e) => setFeaturedForm({ ...featuredForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featuredForm.isActive}
                      onChange={(e) => setFeaturedForm({ ...featuredForm, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFeaturedModal(false)
                  resetFeaturedForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddFeatured} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!featuredForm.productId}
              >
                {editingFeatured ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Watch & Shop Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Watch & Shop</h2>
          <Button
            onClick={() => {
              resetWatchAndShopForm()
              setShowWatchAndShopModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Watch & Shop Item
          </Button>
        </div>

        {/* Search and Filter for Watch & Shop */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
              placeholder="Search watch & shop items..."
              value={watchAndShopSearch}
              onChange={(e) => setWatchAndShopSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={watchAndShopFilter}
            onChange={(e) => setWatchAndShopFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Items</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {filteredWatchAndShop.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {sortedWatchAndShop.length === 0 
                ? "No Watch & Shop items yet. Add items to showcase shoppable videos/images."
                : "No Watch & Shop items match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredWatchAndShop.map((item, index) => {
              const product = item.productId
              const productImage = getImageUrl(item.imageUrl || item.productImage)
              const originalIndex = sortedWatchAndShop.findIndex(w => w._id === item._id)
              
              return (
                <Card 
                  key={item._id} 
                  className="overflow-hidden"
                  draggable
                  onDragStart={(e) => handleWatchAndShopDragStart(e, originalIndex)}
                  onDragOver={handleWatchAndShopDragOver}
                  onDrop={(e) => handleWatchAndShopDrop(e, originalIndex)}
                  style={{ 
                    opacity: draggedWatchAndShopIndex === originalIndex ? 0.5 : 1,
                    cursor: 'move'
                  }}
                >
                  <div className="flex gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center justify-center p-2 cursor-move bg-muted/50">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderWatchAndShop(originalIndex, "up")}
                          disabled={originalIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorderWatchAndShop(originalIndex, "down")}
                          disabled={originalIndex === sortedWatchAndShop.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Item Content */}
                    <div className="flex-1 flex gap-4">
                      <div className="relative w-32 h-32 bg-muted flex-shrink-0 rounded-lg overflow-hidden">
                        {item.videoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/50">
                            <span className="text-white text-xs">Video</span>
                          </div>
                        ) : (
                          <img
                            src={productImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/placeholder.jpg'
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            )}
                            <p className="text-sm font-medium text-primary mt-1">
                              Product: {product?.title || 'Unknown'}
                            </p>
                            {item.productPrice && (
                              <p className="text-sm text-muted-foreground">₹{item.productPrice.toLocaleString()}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Order: {item.order}</span>
                              <span className={`px-2 py-1 rounded ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleWatchAndShopStatus(item)}
                            className={`${item.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
                          >
                            {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditWatchAndShop(item)} 
                            className="flex-1"
                          >
                            <Edit2 size={16} className="mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWatchAndShop(item._id)}
                            className="flex-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Watch & Shop Modal */}
      {showWatchAndShopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingWatchAndShop ? "Edit Watch & Shop Item" : "Add Watch & Shop Item"}
              </h2>
              <button
                onClick={() => {
                  setShowWatchAndShopModal(false)
                  resetWatchAndShopForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Watch & Shop Title"
                  value={watchAndShopForm.title}
                  onChange={(e) => setWatchAndShopForm({ ...watchAndShopForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  placeholder="Description"
                  value={watchAndShopForm.description}
                  onChange={(e) => setWatchAndShopForm({ ...watchAndShopForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Video (Upload or URL)</label>
                <div className="space-y-3">
                  {/* Video Upload Option */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Upload Video File</label>
                    <div className="flex gap-2">
              <input
                type="text"
                        placeholder="Video file path (after upload)"
                        value={watchAndShopForm.videoUrl && (watchAndShopForm.videoUrl.startsWith('/uploads/videos/') || watchAndShopForm.videoUrl.startsWith('uploads/videos/')) ? watchAndShopForm.videoUrl : ''}
                        readOnly
                        className="flex-1 px-4 py-2 border border-input rounded-lg bg-muted text-foreground placeholder-muted-foreground"
                      />
                      <label className="px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent cursor-pointer flex items-center gap-2 whitespace-nowrap">
                        {uploadingWatchVideo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span className="text-sm">Upload Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleVideoUploadWatch(file)
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {watchAndShopForm.videoUrl && (watchAndShopForm.videoUrl.startsWith('/uploads/videos/') || watchAndShopForm.videoUrl.startsWith('uploads/videos/')) && (
                      <div className="mt-2">
                        <video 
                          src={getImageUrl(watchAndShopForm.videoUrl)} 
                          controls
                          className="w-full h-48 rounded-lg bg-black"
                          onError={(e) => {
                            console.error('Video preview error:', e)
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Max size: 100MB. Supported: MP4, WebM, MOV, AVI</p>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-input"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  
                  {/* Video URL Option */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Video URL (YouTube, Vimeo, or direct link)</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
                      value={watchAndShopForm.videoUrl && !watchAndShopForm.videoUrl.startsWith('/uploads/videos/') && !watchAndShopForm.videoUrl.startsWith('uploads/videos/') ? watchAndShopForm.videoUrl : ''}
                      onChange={(e) => {
                        // Clear uploaded video if URL is entered
                        setWatchAndShopForm({ ...watchAndShopForm, videoUrl: e.target.value })
                      }}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
                    <p className="text-xs text-muted-foreground mt-1">Enter YouTube, Vimeo, or direct video URL</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Either video (upload or URL) or image is required</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cover Image (if no video)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL or upload file"
                    value={watchAndShopForm.imageUrl}
                    onChange={(e) => setWatchAndShopForm({ ...watchAndShopForm, imageUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent cursor-pointer flex items-center gap-2">
                    {uploadingWatchImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUploadWatch(file)
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchAndShopForm.imageUrl && (
                  <img 
                    src={getImageUrl(watchAndShopForm.imageUrl)} 
                    alt="Preview" 
                    className="mt-2 h-32 w-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder.jpg'
                    }}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                <select
                  value={watchAndShopForm.productId}
                  onChange={(e) => {
                    const selectedProduct = products.find(p => p._id === e.target.value)
                    const firstVariant = selectedProduct?.variants?.[0]
                    setWatchAndShopForm({ 
                      ...watchAndShopForm, 
                      productId: e.target.value,
                      productImage: firstVariant?.images?.[0] || "",
                      productPrice: firstVariant?.price?.toString() || ""
                    })
                  }}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => {
                    const firstVariant = product.variants?.[0]
                    const productPrice = firstVariant?.price || 0
                    return (
                      <option key={product._id} value={product._id}>
                        {product.title} - ₹{productPrice.toLocaleString()}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
              <input
                type="number"
                    value={watchAndShopForm.order}
                    onChange={(e) => setWatchAndShopForm({ ...watchAndShopForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchAndShopForm.isActive}
                      onChange={(e) => setWatchAndShopForm({ ...watchAndShopForm, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowWatchAndShopModal(false)
                  resetWatchAndShopForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWatchAndShop} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!watchAndShopForm.title || !watchAndShopForm.productId || (!watchAndShopForm.videoUrl && !watchAndShopForm.imageUrl)}
              >
                {editingWatchAndShop ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
