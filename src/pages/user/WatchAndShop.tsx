import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, X, Pause, Volume2, VolumeX } from "lucide-react";
import { homepageApi } from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";

interface WatchAndShopItem {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  productId: {
    _id: string;
    title: string;
    category?: string;
    subcategory?: string;
    fabric?: string;
    styleNumber?: string;
    variants: Array<{
      images: string[];
      price: number;
      stock?: number;
      color?: string;
      size?: string;
    }>;
  };
  productImage?: string;
  productPrice?: number;
  order: number;
  isActive: boolean;
}

const WatchAndShop: React.FC = () => {
  const [items, setItems] = useState<WatchAndShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Watch & Shop");
  const [sectionSubtitle, setSectionSubtitle] = useState("Shop directly from our videos and images");
  const [sectionVisible, setSectionVisible] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WatchAndShopItem | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Hide bottom nav when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      // Hide bottom nav
      const bottomNav = document.querySelector('.bottom-nav-bar');
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = 'none';
      }
    } else {
      document.body.style.overflow = '';
      // Show bottom nav again
      const bottomNav = document.querySelector('.bottom-nav-bar');
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = '';
      }
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      const bottomNav = document.querySelector('.bottom-nav-bar');
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = '';
      }
    };
  }, [selectedItem]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch section title/subtitle
      const sectionResponse = await homepageApi.getSectionByType('watch-and-shop', false);
      if (sectionResponse.data && Array.isArray(sectionResponse.data) && sectionResponse.data.length > 0) {
        const section = sectionResponse.data[0];
        const isActive = section?.isActive ?? true;
        setSectionVisible(isActive);
        if (!isActive) {
          setItems([]);
          return;
        }
        if (section.title) setSectionTitle(section.title);
        if (section.subtitle) setSectionSubtitle(section.subtitle);
      } else {
        setSectionVisible(true);
      }
      
      // Fetch Watch & Shop items
      const response = await homepageApi.getWatchAndShop(true); // Only get active items
      
      if (response.data && Array.isArray(response.data)) {
        // Sort by order
        const sorted = [...response.data].sort((a: WatchAndShopItem, b: WatchAndShopItem) => a.order - b.order);
        setItems(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Calculate scroll amount to show next/previous 2 cards
    const containerWidth = scrollRef.current.clientWidth;
    const scrollAmount = direction === "left" ? -containerWidth : containerWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleCardClick = (item: WatchAndShopItem) => {
    const index = items.findIndex(i => i._id === item._id);
    setCurrentVideoIndex(index);
    setSelectedItem(item);
    setIsVideoPlaying(true);
    setIsMuted(false); // Start unmuted
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < items.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIndex);
      setSelectedItem(items[nextIndex]);
      setIsVideoPlaying(true);
      // Reset video state
      if (videoRef.current) {
        videoRef.current.load();
      }
      // Scroll to next video
      if (modalScrollRef.current) {
        const videoHeight = window.innerHeight;
        modalScrollRef.current.scrollTo({
          top: nextIndex * videoHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      setSelectedItem(items[prevIndex]);
      setIsVideoPlaying(true);
      // Reset video state
      if (videoRef.current) {
        videoRef.current.load();
      }
      // Scroll to previous video
      if (modalScrollRef.current) {
        const videoHeight = window.innerHeight;
        modalScrollRef.current.scrollTo({
          top: prevIndex * videoHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Handle touch/swipe for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && currentVideoIndex < items.length - 1) {
      handleNextVideo();
    }
    if (isDownSwipe && currentVideoIndex > 0) {
      handlePrevVideo();
    }
  };

  // Handle scroll to detect video change
  const handleModalScroll = () => {
    if (!modalScrollRef.current) return;
    const scrollTop = modalScrollRef.current.scrollTop;
    const videoHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < items.length) {
      setCurrentVideoIndex(newIndex);
      setSelectedItem(items[newIndex]);
      setIsVideoPlaying(true);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  const handleProductClick = (productId: string | null | undefined, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!productId) return;
    handleCloseModal();
    navigate(`/product/${productId}`);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  useEffect(() => {
    if (selectedItem && videoRef.current && selectedItem.videoUrl) {
      const video = videoRef.current;
      const videoUrl = getVideoEmbedUrl(selectedItem.videoUrl, false, false);
      
      // Only handle direct video files, not YouTube/Vimeo embeds
      if (videoUrl && !videoUrl.includes('youtube.com/embed') && !videoUrl.includes('vimeo.com/video')) {
        video.load();
        video.muted = isMuted;
        
        // Auto-play when modal opens or video changes
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVideoPlaying(true);
            })
            .catch(err => {
              console.error('Video play error:', err);
              // If autoplay fails (browser policy), user can click play
              setIsVideoPlaying(false);
            });
        }
      } else {
        // For YouTube/Vimeo, just set playing state
        setIsVideoPlaying(true);
      }
    }
  }, [selectedItem, currentVideoIndex, isMuted]);

  const getVideoEmbedUrl = (url: string, autoplay: boolean = false, muted: boolean = false): string | null => {
    if (!url) return null;
    
    // Check if it's already a full URL (starts with http:// or https://)
    const isFullUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      const autoplayParam = autoplay ? '&autoplay=1' : '';
      const muteParam = muted ? '&mute=1' : '&mute=0';
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1${autoplayParam}${muteParam}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      const autoplayParam = autoplay ? '&autoplay=1' : '';
      const muteParam = muted ? '&muted=1' : '&muted=0';
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${autoplayParam}${muteParam}`;
    }
    
    // Direct video URL - check if it's a path or full URL
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      // If it's a path (starts with /uploads/), convert to full URL
      if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        return getImageUrl(url);
      }
      // If it's already a full URL, return as is
      if (isFullUrl) {
        return url;
      }
      // Otherwise, treat as path and convert to full URL
      return getImageUrl(url);
    }
    
    // If it's a path that might be a video, try to convert it
    if (url.startsWith('/uploads/videos/') || url.startsWith('uploads/videos/')) {
      return getImageUrl(url);
    }
    
    return null;
  };

  if (!sectionVisible) {
    return null;
  }

  if (loading) {
    return (
      <div className="theme-gradient-light py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show section if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="theme-gradient-light py-8 sm:py-12 lg:py-16">
      <div className="max-w-6xl lg:max-w-6xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="heading-luxury text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-2 lg:mb-3">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl lg:max-w-3xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Watch & Shop - Responsive Grid (laptop/desktop) and Horizontal Scroll (mobile) */}
        <div className="relative">
          {/* Tablet/Laptop/Desktop: CSS Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-8">
            {items.map((item) => {
              const product = item.productId;
              const productImage = getImageUrl(
                item.productImage || 
                (product?.variants?.[0]?.images?.[0]) || 
                ''
              );
              const productPrice = item.productPrice || product?.variants?.[0]?.price || 0;
              const videoEmbedUrl = item.videoUrl ? getVideoEmbedUrl(item.videoUrl, false, false) : null;
              const displayImage = getImageUrl(item.imageUrl || productImage);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl xl:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative cursor-pointer"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="relative w-full aspect-[3/4] bg-black rounded-2xl xl:rounded-3xl overflow-hidden">
                    {videoEmbedUrl ? (
                      <div className="w-full h-full">
                        {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com/video') ? (
                          <iframe
                            src={item.videoUrl ? (getVideoEmbedUrl(item.videoUrl, true, false) || videoEmbedUrl) : videoEmbedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                          />
                        ) : (
                          <video
                            src={videoEmbedUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              const img = target.parentElement?.querySelector('img');
                              if (img) {
                                img.style.display = 'block';
                                target.style.display = 'none';
                              }
                            }}
                          >
                            <source src={videoEmbedUrl} type="video/mp4" />
                            <source src={videoEmbedUrl} type="video/webm" />
                          </video>
                        )}
                        <img
                          src={displayImage}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover hidden"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={displayImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile only: Horizontal Scroll */}
          <div className="md:hidden relative">
            {items.length > 2 && (
              <button
                onClick={() => scroll("right")}
                className="absolute -right-2 sm:-right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:shadow-lg p-2 rounded-full z-10 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item) => {
                const product = item.productId;
                const productImage = getImageUrl(
                  item.productImage || 
                  (product?.variants?.[0]?.images?.[0]) || 
                  ''
                );
                const productPrice = item.productPrice || product?.variants?.[0]?.price || 0;
                const videoEmbedUrl = item.videoUrl ? getVideoEmbedUrl(item.videoUrl, false, false) : null;
                const displayImage = getImageUrl(item.imageUrl || productImage);

                return (
                  <div
                    key={item._id}
                    className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer"
                    onClick={() => handleCardClick(item)}
                  >
                  {/* Video/Image Section - Full Card */}
                  <div className="relative w-full aspect-[3/4] bg-black rounded-2xl lg:rounded-3xl overflow-hidden">
                    {videoEmbedUrl ? (
                      <div className="w-full h-full">
                        {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com/video') ? (
                          <iframe
                            src={item.videoUrl ? (getVideoEmbedUrl(item.videoUrl, true, false) || videoEmbedUrl) : videoEmbedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                          />
                        ) : (
                          <video
                            src={videoEmbedUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              const img = target.parentElement?.querySelector('img');
                              if (img) {
                                img.style.display = 'block';
                                target.style.display = 'none';
                              }
                            }}
                          >
                            <source src={videoEmbedUrl} type="video/mp4" />
                            <source src={videoEmbedUrl} type="video/webm" />
                          </video>
                        )}
                        {/* Fallback image if video fails */}
                        <img
                          src={displayImage}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover hidden"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={displayImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal: large screen = split (image left, product right), mobile = full-screen scroll + overlay */}
      {selectedItem && (() => {
        const currentItem = items[currentVideoIndex];
        if (!currentItem) return null;

        return (
          <div className="fixed inset-0 bg-black z-[9999]">
            {/* Progress Indicator - Fixed at top left */}
            <div className="fixed top-4 left-4 lg:top-6 lg:left-6 text-black text-sm lg:text-base font-semibold z-50 bg-white rounded-full px-3 py-1.5 lg:px-4 lg:py-2 shadow-md lg:shadow-lg">
              {currentVideoIndex + 1}/{items.length}
            </div>

            {/* Close Button - Fixed at top right */}
            <button
              onClick={handleCloseModal}
              className="fixed top-4 right-4 lg:top-6 lg:right-6 text-white hover:text-gray-200 z-50 bg-black rounded-full p-2 lg:p-3 shadow-lg transition-all hover:scale-110 lg:right-[calc(420px+1.5rem)] xl:right-[calc(480px+1.5rem)]"
              aria-label="Close"
            >
              <X size={20} className="lg:w-6 lg:h-6" />
            </button>

            {/* ——— Large screen: split layout ——— */}
            <div className="hidden lg:flex lg:h-screen lg:w-full">
              {/* Left: Media (video/image) */}
              <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center bg-black relative">
                {currentItem.videoUrl && getVideoEmbedUrl(currentItem.videoUrl, false, false) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {getVideoEmbedUrl(currentItem.videoUrl, false, false)?.includes('youtube.com/embed') ||
                     getVideoEmbedUrl(currentItem.videoUrl, false, false)?.includes('vimeo.com/video') ? (
                      <iframe
                        src={getVideoEmbedUrl(currentItem.videoUrl, true, isMuted) || ''}
                        className="w-full h-full max-h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentItem.title}
                      />
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          src={getVideoEmbedUrl(currentItem.videoUrl, false, false) || ''}
                          className="w-full h-full object-contain"
                          autoPlay
                          muted={isMuted}
                          playsInline
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                          onEnded={handleNextVideo}
                          onLoadedMetadata={() => {
                            if (videoRef.current) videoRef.current.muted = isMuted;
                          }}
                        >
                          <source src={getVideoEmbedUrl(currentItem.videoUrl, false, false) || ''} type="video/mp4" />
                          <source src={getVideoEmbedUrl(currentItem.videoUrl, false, false) || ''} type="video/webm" />
                        </video>
                        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-30">
                          <button
                            onClick={togglePlayPause}
                            className="bg-black/80 rounded-full p-3 text-white transition-all shadow-lg hover:bg-black hover:scale-110"
                            aria-label={isVideoPlaying ? "Pause" : "Play"}
                          >
                            {isVideoPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                          </button>
                          <button
                            onClick={toggleMute}
                            className="bg-black/80 rounded-full p-3 text-white transition-all shadow-lg hover:bg-black hover:scale-110"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src={getImageUrl(currentItem.imageUrl || currentItem.productImage || currentItem.productId?.variants?.[0]?.images?.[0])}
                    alt={currentItem.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>

              {/* Right: Product details panel */}
              <div className="w-[420px] xl:w-[480px] flex-shrink-0 bg-white overflow-y-auto shadow-xl flex flex-col">
                <div className="p-6 xl:p-8 flex flex-col flex-1">
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-6">
                    <img
                      src={getImageUrl(currentItem.productImage || currentItem.productId?.variants?.[0]?.images?.[0])}
                      alt={currentItem.productId?.title || 'Product'}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <h2 className="text-xl xl:text-2xl font-semibold text-gray-900 mb-2">
                    {currentItem.title || currentItem.productId?.title}
                  </h2>
                  {currentItem.description && (
                    <p className="text-gray-600 text-sm xl:text-base mb-6 line-clamp-4">
                      {currentItem.description}
                    </p>
                  )}
                  <p className="text-2xl xl:text-3xl font-bold text-gray-900 mb-6">
                    ₹{(currentItem.productPrice || currentItem.productId?.variants?.[0]?.price || 0).toLocaleString()}
                  </p>

                  {/* Three product details */}
                  <div className="space-y-3 mb-8 border-t border-gray-100 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="text-gray-900 font-medium">
                        {[currentItem.productId?.category, currentItem.productId?.subcategory].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Availability</span>
                      <span className="text-gray-900 font-medium">
                        {currentItem.productId?.variants?.some((v: { stock?: number }) => (v?.stock ?? 0) > 0)
                          ? 'In stock'
                          : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fabric / Style</span>
                      <span className="text-gray-900 font-medium">
                        {[currentItem.productId?.fabric, currentItem.productId?.styleNumber].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleProductClick(currentItem.productId?._id, e)}
                    disabled={!currentItem.productId?._id}
                    className="w-full py-3 xl:py-4 px-6 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View product
                  </button>
                  {/* Prev/Next on large screen */}
                  {items.length > 1 && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handlePrevVideo}
                        disabled={currentVideoIndex === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={20} /> Previous
                      </button>
                      <button
                        onClick={handleNextVideo}
                        disabled={currentVideoIndex === items.length - 1}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Next <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ——— Mobile: full-screen scroll + bottom product overlay ——— */}
            <div
              ref={modalScrollRef}
              className="lg:hidden fixed inset-0 overflow-y-scroll snap-y snap-mandatory"
              onScroll={handleModalScroll}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item, index) => (
                <div key={item._id} className="relative w-full h-screen snap-start">
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {item.videoUrl && getVideoEmbedUrl(item.videoUrl, false, false) ? (
                      <div className="w-full h-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl mx-auto">
                        {getVideoEmbedUrl(item.videoUrl, false, false)?.includes('youtube.com/embed') ||
                         getVideoEmbedUrl(item.videoUrl, false, false)?.includes('vimeo.com/video') ? (
                          <iframe
                            src={getVideoEmbedUrl(item.videoUrl, index === currentVideoIndex, isMuted) || ''}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                          />
                        ) : (
                          <video
                            ref={index === currentVideoIndex ? videoRef : null}
                            src={getVideoEmbedUrl(item.videoUrl, false, false) || ''}
                            className="w-full h-full object-contain"
                            autoPlay={index === currentVideoIndex}
                            muted={isMuted}
                            playsInline
                            onPlay={() => index === currentVideoIndex && setIsVideoPlaying(true)}
                            onPause={() => index === currentVideoIndex && setIsVideoPlaying(false)}
                            onEnded={() => index === currentVideoIndex && handleNextVideo()}
                            onLoadedMetadata={() => {
                              if (index === currentVideoIndex && videoRef.current) videoRef.current.muted = isMuted;
                            }}
                          >
                            <source src={getVideoEmbedUrl(item.videoUrl, false, false) || ''} type="video/mp4" />
                            <source src={getVideoEmbedUrl(item.videoUrl, false, false) || ''} type="video/webm" />
                          </video>
                        )}
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(item.imageUrl || item.productImage || item.productId?.variants?.[0]?.images?.[0])}
                        alt={item.title}
                        className="w-full h-full object-contain max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}

                    {index === currentVideoIndex && item.videoUrl &&
                     !getVideoEmbedUrl(item.videoUrl, false, false)?.includes('youtube.com/embed') &&
                     !getVideoEmbedUrl(item.videoUrl, false, false)?.includes('vimeo.com/video') && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
                        <button onClick={togglePlayPause} className="bg-black rounded-full p-2.5 text-white shadow-lg" aria-label={isVideoPlaying ? "Pause" : "Play"}>
                          {isVideoPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                        </button>
                        <button onClick={toggleMute} className="bg-black rounded-full p-2.5 text-white shadow-lg" aria-label={isMuted ? "Unmute" : "Mute"}>
                          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      </div>
                    )}

                    {index === currentVideoIndex && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl cursor-pointer hover:bg-gray-50 transition-all z-30 shadow-xl flex justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(item.productId?._id, e);
                        }}
                      >
                        <div className="w-full max-w-[95vw] sm:max-w-[90vw] mx-auto p-3 sm:p-4">
                          <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4 items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-gray-100">
                              <img
                                src={getImageUrl(item.productImage || item.productId?.variants?.[0]?.images?.[0])}
                                alt={item.productId?.title || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholder.jpg';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-sm sm:text-base mb-0.5 line-clamp-2 text-gray-900">
                                {item.title || item.productId?.title}
                              </h3>
                              <p className="text-base sm:text-lg font-bold text-gray-900">
                                ₹{(item.productPrice || item.productId?.variants?.[0]?.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default WatchAndShop;

