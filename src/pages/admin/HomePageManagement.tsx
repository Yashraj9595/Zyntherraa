"use client"

import { useState } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Plus, Edit2, Trash2, X } from "lucide-react"

interface BannerSection {
  id: number
  title: string
  subtitle: string
  image: string
  buttonText: string
  buttonLink: string
}

interface FeaturedProduct {
  id: number
  name: string
  image: string
  price: number
}

const mockBanners: BannerSection[] = [
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "Discover the latest summer styles",
    image: "/summer-collection-display.png",
    buttonText: "Shop Now",
    buttonLink: "/shop",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Fresh styles just in",
    image: "/new-arrivals-display.png",
    buttonText: "Explore",
    buttonLink: "/new",
  },
]

const mockFeatured: FeaturedProduct[] = [
  { id: 1, name: "Classic T-Shirt", image: "/plain-white-tshirt.png", price: 29.99 },
  { id: 2, name: "Blue Jeans", image: "/folded-denim-stack.png", price: 79.99 },
  { id: 3, name: "Summer Dress", image: "/elegant-flowing-dress.png", price: 59.99 },
]

export default function HomePageManagement() {
  const [banners, setBanners] = useState<BannerSection[]>(mockBanners)
  const [featured, setFeatured] = useState<FeaturedProduct[]>(mockFeatured)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showFeaturedModal, setShowFeaturedModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerSection | null>(null)
  const [editingFeatured, setEditingFeatured] = useState<FeaturedProduct | null>(null)
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    buttonText: "",
    buttonLink: "",
  })
  const [featuredForm, setFeaturedForm] = useState({
    name: "",
    image: "",
    price: "",
  })

  const handleAddBanner = () => {
    if (bannerForm.title && bannerForm.subtitle) {
      if (editingBanner) {
        setBanners(
          banners.map((b) =>
            b.id === editingBanner.id
              ? {
                  ...b,
                  title: bannerForm.title,
                  subtitle: bannerForm.subtitle,
                  image: bannerForm.image,
                  buttonText: bannerForm.buttonText,
                  buttonLink: bannerForm.buttonLink,
                }
              : b,
          ),
        )
        setEditingBanner(null)
      } else {
        setBanners([
          ...banners,
          {
            id: Math.max(...banners.map((b) => b.id), 0) + 1,
            title: bannerForm.title,
            subtitle: bannerForm.subtitle,
            image: bannerForm.image,
            buttonText: bannerForm.buttonText,
            buttonLink: bannerForm.buttonLink,
          },
        ])
      }
      setBannerForm({ title: "", subtitle: "", image: "", buttonText: "", buttonLink: "" })
      setShowBannerModal(false)
    }
  }

  const handleAddFeatured = () => {
    if (featuredForm.name && featuredForm.price) {
      if (editingFeatured) {
        setFeatured(
          featured.map((f) =>
            f.id === editingFeatured.id
              ? {
                  ...f,
                  name: featuredForm.name,
                  image: featuredForm.image,
                  price: Number.parseFloat(featuredForm.price),
                }
              : f,
          ),
        )
        setEditingFeatured(null)
      } else {
        setFeatured([
          ...featured,
          {
            id: Math.max(...featured.map((f) => f.id), 0) + 1,
            name: featuredForm.name,
            image: featuredForm.image,
            price: Number.parseFloat(featuredForm.price),
          },
        ])
      }
      setFeaturedForm({ name: "", image: "", price: "" })
      setShowFeaturedModal(false)
    }
  }

  const openEditBanner = (banner: BannerSection) => {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
    })
    setShowBannerModal(true)
  }

  const openEditFeatured = (product: FeaturedProduct) => {
    setEditingFeatured(product)
    setFeaturedForm({
      name: product.name,
      image: product.image,
      price: product.price.toString(),
    })
    setShowFeaturedModal(true)
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Home Page Management</h1>
        <p className="text-muted-foreground mt-2">Customize your home page banners and featured products</p>
      </div>

      {/* Banner Sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Banner Sections</h2>
          <Button
            onClick={() => {
              setEditingBanner(null)
              setBannerForm({ title: "", subtitle: "", image: "", buttonText: "", buttonLink: "" })
              setShowBannerModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={20} className="mr-2" />
            Add Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                <img
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground">{banner.title}</h3>
                  <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditBanner(banner)} className="flex-1">
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBanners(banners.filter((b) => b.id !== banner.id))}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
          <Button
            onClick={() => {
              setEditingFeatured(null)
              setFeaturedForm({ name: "", image: "", price: "" })
              setShowFeaturedModal(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground">{product.name}</h3>
                  <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditFeatured(product)} className="flex-1">
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFeatured(featured.filter((f) => f.id !== product.id))}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">{editingBanner ? "Edit Banner" : "Add Banner"}</h2>
              <button onClick={() => setShowBannerModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Banner Title"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={bannerForm.image}
                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Button Text"
                value={bannerForm.buttonText}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Button Link"
                value={bannerForm.buttonLink}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowBannerModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBanner} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingBanner ? "Save Changes" : "Add Banner"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Featured Product Modal */}
      {showFeaturedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingFeatured ? "Edit Product" : "Add Featured Product"}
              </h2>
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={featuredForm.name}
                onChange={(e) => setFeaturedForm({ ...featuredForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={featuredForm.image}
                onChange={(e) => setFeaturedForm({ ...featuredForm, image: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Price"
                value={featuredForm.price}
                onChange={(e) => setFeaturedForm({ ...featuredForm, price: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowFeaturedModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFeatured} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingFeatured ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
