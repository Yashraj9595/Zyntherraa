// Responsive utility classes and helpers for consistent mobile design

export const responsiveClasses = {
  // Container classes
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  containerTight: "container mx-auto px-2 sm:px-4 lg:px-6",
  
  // Padding classes
  padding: {
    section: "py-6 sm:py-8 md:py-12 lg:py-16",
    sectionSmall: "py-4 sm:py-6 md:py-8",
    card: "p-4 sm:p-6 lg:p-8",
    cardSmall: "p-3 sm:p-4 lg:p-6",
  },
  
  // Margin classes
  margin: {
    section: "mb-6 sm:mb-8 md:mb-12",
    element: "mb-4 sm:mb-6",
    elementSmall: "mb-2 sm:mb-4",
  },
  
  // Typography classes
  text: {
    hero: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
    title: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
    subtitle: "text-lg sm:text-xl md:text-2xl",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    button: "text-sm sm:text-base",
    buttonSmall: "text-xs sm:text-sm",
  },
  
  // Grid classes
  grid: {
    products: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    categories: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    features: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  },
  
  // Gap classes
  gap: {
    small: "gap-2 sm:gap-3 md:gap-4",
    medium: "gap-3 sm:gap-4 md:gap-6",
    large: "gap-4 sm:gap-6 md:gap-8",
  },
  
  // Button classes
  button: {
    primary: "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg",
    secondary: "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md",
    icon: "p-2 sm:p-3 rounded-lg",
    iconSmall: "p-1.5 sm:p-2 rounded-md",
  },
  
  // Image classes
  image: {
    product: "h-48 sm:h-56 md:h-64",
    category: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32",
    avatar: "w-8 h-8 sm:w-10 sm:h-10",
    hero: "h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]",
  },
  
  // Spacing classes
  space: {
    xs: "space-y-1 sm:space-y-2",
    sm: "space-y-2 sm:space-y-3",
    md: "space-y-3 sm:space-y-4 md:space-y-6",
    lg: "space-y-4 sm:space-y-6 md:space-y-8",
  },
  
  // Flex classes
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-start",
    end: "flex items-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center",
    wrap: "flex flex-wrap",
  },
};

// Breakpoint helpers
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Mobile-first media queries
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

// Responsive helper functions
export const getResponsiveClass = (base: string, variants: Record<string, string>) => {
  return Object.entries(variants)
    .map(([breakpoint, value]) => `${breakpoint}:${value}`)
    .join(' ');
};

// Common responsive patterns
export const responsivePatterns = {
  // Hide on mobile, show on desktop
  hideOnMobile: "hidden md:block",
  
  // Show on mobile, hide on desktop
  showOnMobile: "block md:hidden",
  
  // Stack on mobile, row on desktop
  stackOnMobile: "flex flex-col md:flex-row",
  
  // Full width on mobile, auto on desktop
  fullWidthOnMobile: "w-full md:w-auto",
  
  // Center on mobile, left align on desktop
  centerOnMobile: "text-center md:text-left",
  
  // Smaller on mobile, larger on desktop
  scaleOnMobile: "scale-90 sm:scale-100",
};

// Touch-friendly sizes for mobile
export const touchTargets = {
  minimum: "min-h-[44px] min-w-[44px]", // iOS HIG minimum
  comfortable: "min-h-[48px] min-w-[48px]", // Material Design
  large: "min-h-[56px] min-w-[56px]", // Large touch target
};

// Safe area classes for mobile devices
export const safeArea = {
  top: "pt-safe-top",
  bottom: "pb-safe-bottom",
  left: "pl-safe-left",
  right: "pr-safe-right",
  all: "p-safe",
};

export default responsiveClasses;
