import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Send, ShoppingCart, Bot, Mic } from 'lucide-react';
import { ProductCard } from './product-card';
import { CompactProductCard } from './compact-product-card';
import { DeliveryStyleProductCard } from './delivery-style-product-card';
import { ItemDetailModal } from './item-detail-modal';
import { VendorStoreSheet } from './vendor-store-sheet';
import { CartView } from './cart-view';
import { VoiceRecorder } from './voice-recorder';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RiyalSymbol } from './riyal-symbol';

import { toast } from "sonner@2.0.3";

import imgLogo1 from "figma:asset/5eee79a358f142fe05e52abc1c53289aa37c6100.png";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
  vendorSuggestions?: VendorSuggestion[]; // New field for vendor-grouped suggestions
  quickActions?: QuickAction[];
  suggestions?: SuggestionButton[];
  searchContext?: string;
  isVoiceMessage?: boolean;
}

// New interface for vendor-grouped suggestions
interface VendorSuggestion {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  products: Product[];
}

interface SuggestionButton {
  id: string;
  label: string;
  searchQuery: string;
}

interface Product {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  customizationOptions: CustomizationOption[];
}

interface CustomizationOption {
  id: string;
  name: string;
  type: 'select' | 'text' | 'number';
  required: boolean;
  options?: string[];
}

interface QuickAction {
  id: string;
  label: string;
  action: 'continue_shopping' | 'view_cart' | 'checkout';
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  price: number;
  image: string;
  quantity: number;
  customizations: Record<string, any>;
}

interface AIChatProps {
  cartCount: number;
  cartVendor?: string; // The vendor of items currently in cart
  cartItems: CartItem[];
  onAddToCart: (product: Product, customizations: Record<string, any>) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

const predefinedPrompts = [
  {
    id: "saudi-national-day",
    title: "Saudi National Day decorations",
    description: "",
    query: "Saudi National Day decorations and celebration items",
    image: "/src/assets/balloons-party.jpg"
  },
  {
    id: "30th-birthday",
    title: "30th birthday surprise",
    description: "",
    query: "30th birthday surprise gift ideas",
    image: "/src/assets/perfume-gift.jpg"
  },
  {
    id: "graduation-gifts",
    title: "Graduation gifts under 500 SAR",
    description: "",
    query: "Graduation gifts under 500 SAR",
    image: "/src/assets/flower-bouquet.jpg"
  },
  {
    id: "anniversary-wife",
    title: "Anniversary gift for wife",
    description: "",
    query: "Anniversary gift for wife romantic surprise",
    image: "https://images.unsplash.com/photo-1758874089787-e834e989260c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbm5pdmVyc2FyeSUyMHJvbWFudGljJTIwZGlubmVyfGVufDF8fHx8MTc1OTQyOTU4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "corporate-gifts",
    title: "Corporate gifts for clients",
    description: "",
    query: "Corporate gifts for clients professional",
    image: "/src/assets/perfume-gift.jpg"
  },
  {
    id: "ramadan-hosting",
    title: "Ramadan hosting essentials",
    description: "",
    query: "Ramadan hosting essentials and decorations",
    image: "/src/assets/balloons-party.jpg"
  },
  {
    id: "new-baby",
    title: "Welcome baby gift",
    description: "Celebrate new arrival",
    query: "New baby welcome gift basket",
    image: "https://images.unsplash.com/photo-1672838564872-6a8184194da2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwZ2lmdCUyMGJhc2tldHxlbnwxfHx8fDE3NTk0Mjk1OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "corporate",
    title: "Business gifts",
    description: "Professional appreciation",
    query: "Corporate business gift professional",
    image: "https://images.unsplash.com/photo-1625552187571-7ee60ac43d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMGdpZnR8ZW58MXx8fHwxNzU5NDI5NTk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "apology",
    title: "Apology gift",
    description: "Make things right",
    query: "Apology gift flowers sorry",
    image: "https://images.unsplash.com/photo-1620843437920-ead942b3abd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFuayUyMHlvdSUyMGZsb3dlcnMlMjBnaWZ0fGVufDF8fHx8MTc1OTQyOTU4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "get-well",
    title: "Get well soon",
    description: "Wishes for recovery",
    query: "Get well soon gift care package",
    image: "https://images.unsplash.com/photo-1620843437920-ead942b3abd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFuayUyMHlvdSUyMGZsb3dlcnMlMjBnaWZ0fGVufDF8fHx8MTc1OTQyOTU4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "housewarming",
    title: "Housewarming gift",
    description: "Welcome to new home",
    query: "Housewarming gift new home",
    image: "https://images.unsplash.com/photo-1625552187571-7ee60ac43d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMGdpZnR8ZW58MXx8fHwxNzU5NDI5NTk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

// All products now use local assets, no exclusions needed

const mockProducts: Product[] = [
  // Jeddah Flowers - 2 products
  {
    id: '1',
    name: 'Premium Flower Bouquet',
    vendor: 'Jeddah Flowers',
    price: 199,
    image: '/assets/Flower Bouquet Image from Unsplash.jpg',
    rating: 4.8,
    reviewCount: 124,
    description: 'Beautiful mixed flower bouquet with roses, lilies, and seasonal flowers.',
    customizationOptions: [
      { id: 'size', name: 'Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
      { id: 'message', name: 'Gift Message', type: 'text', required: false }
    ]
  },
  {
    id: '2',
    name: 'Rose Garden Bouquet',
    vendor: 'Jeddah Flowers',
    price: 159,
    image: '/assets/Flower Image from Unsplash.jpg',
    rating: 4.7,
    reviewCount: 98,
    description: 'Classic red roses arranged in an elegant bouquet.',
    customizationOptions: [
      { id: 'size', name: 'Size', type: 'select', required: true, options: ['12 Roses', '24 Roses', '36 Roses'] },
      { id: 'message', name: 'Gift Message', type: 'text', required: false }
    ]
  },
  // Sweet Delights - 2 products
  {
    id: '3',
    name: 'Luxury Chocolate Box',
    vendor: 'Sweet Delights',
    price: 149,
    image: '/assets/Gift Picture from Unsplash.jpg',
    rating: 4.6,
    reviewCount: 89,
    description: 'Assorted premium chocolates in an elegant gift box.',
    customizationOptions: [
      { id: 'flavor', name: 'Flavor Mix', type: 'select', required: true, options: ['Dark & Milk', 'Assorted', 'Dark Only'] },
      { id: 'message', name: 'Gift Message', type: 'text', required: false }
    ]
  },
  {
    id: '4',
    name: 'Celebration Bouquet',
    vendor: 'Jeddah Flowers',
    price: 189,
    image: '/assets/Flower Bouquet Image from Unsplash (1).jpg',
    rating: 4.9,
    reviewCount: 203,
    description: 'Beautiful celebration bouquet perfect for special occasions.',
    customizationOptions: [
      { id: 'size', name: 'Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
      { id: 'message', name: 'Gift Message', type: 'text', required: false }
    ]
  },
  // Party Central - 2 products
  {
    id: '5',
    name: 'Birthday Balloon Set',
    vendor: 'Party Central',
    price: 89,
    image: '/assets/Balloons Photography.jpg',
    rating: 4.4,
    reviewCount: 156,
    description: 'Colorful birthday balloon arrangement with helium included.',
    customizationOptions: [
      { id: 'color', name: 'Color Theme', type: 'select', required: true, options: ['Rainbow', 'Gold & Black', 'Pink & White'] },
      { id: 'number', name: 'Age Number', type: 'number', required: false }
    ]
  },
  {
    id: '6',
    name: 'Party Balloon Collection',
    vendor: 'Party Central',
    price: 129,
    image: '/assets/Balloons Picture from Unsplash.jpg',
    rating: 4.5,
    reviewCount: 78,
    description: 'Premium balloon collection for any celebration.',
    customizationOptions: [
      { id: 'theme', name: 'Party Theme', type: 'select', required: true, options: ['Birthday', 'Anniversary', 'Graduation'] },
      { id: 'colors', name: 'Color Scheme', type: 'select', required: true, options: ['Rainbow', 'Elegant', 'Bright'] }
    ]
  },
  // Le Jardin Restaurant - 2 products
  {
    id: '7',
    name: 'Fine Dining Experience',
    vendor: 'Le Jardin Restaurant',
    price: 299,
    image: '/assets/Perfume Picture from Unsplash.jpg',
    rating: 4.9,
    reviewCount: 234,
    description: 'Elegant 3-course dinner for two at Jeddah\'s finest restaurant.',
    customizationOptions: [
      { id: 'menu', name: 'Menu Type', type: 'select', required: true, options: ['Traditional', 'International', 'Vegetarian'] },
      { id: 'date', name: 'Preferred Date', type: 'text', required: true }
    ]
  },
  {
    id: '8',
    name: 'Luxury Perfume Gift Set',
    vendor: 'Le Jardin Restaurant',
    price: 249,
    image: '/assets/Perfume Picture from Unsplash (1).jpg',
    rating: 4.8,
    reviewCount: 156,
    description: 'Premium perfume collection with elegant packaging.',
    customizationOptions: [
      { id: 'scent', name: 'Fragrance Type', type: 'select', required: true, options: ['Floral', 'Woody', 'Fresh', 'Oriental'] },
      { id: 'size', name: 'Bottle Size', type: 'select', required: true, options: ['30ml', '50ml', '100ml'] }
    ]
  }
];

// Function to create vendor suggestions from existing products
const createVendorSuggestions = (): VendorSuggestion[] => {
  // Group products by vendor
  const vendorGroups = mockProducts.reduce((acc, product) => {
    if (!acc[product.vendor]) {
      acc[product.vendor] = [];
    }
    acc[product.vendor].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Create vendor suggestions with descriptions
  const vendorDescriptions: Record<string, string> = {
    'Jeddah Flowers': 'Premium flower arrangements and bouquets for all occasions in Jeddah.',
    'Sweet Delights': 'Artisan chocolates, cakes, and sweet treats made with finest ingredients.',
    'Party Central': 'Complete party supplies and decorations for memorable celebrations.',
    'Le Jardin Restaurant': 'Fine dining experiences and gourmet meals in elegant settings.'
  };

  return Object.entries(vendorGroups).map(([vendorName, products]) => ({
    id: vendorName.toLowerCase().replace(/\s+/g, '-'),
    name: vendorName,
    description: vendorDescriptions[vendorName] || `Quality products and services from ${vendorName}.`,
    products: products
  }));
};

// Helper function to get vendor logo URL
const getVendorLogoUrl = (vendorName: string): string | undefined => {
  const brandImages: Record<string, string> = {
    'jeddah flowers': 'https://files.slack.com/files-pri/T7SAV7LAD-F09KQF5N0QG/screenshot_2025-10-05_at_10.41.41___pm.png?pub_secret=9a5b11cdce',
    'sweet delights': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JPR190HH/screenshot_2025-10-05_at_10.41.59___pm.png?pub_secret=ebda480cca',
    'party central': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JU4RGYNS/screenshot_2025-10-05_at_10.42.45___pm.png?pub_secret=b17ec4dbf0',
    'le jardin restaurant': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JZPHDDPW/screenshot_2025-10-05_at_10.43.19___pm.png?pub_secret=5d0e2b51bd'
  };
  
  return brandImages[vendorName.toLowerCase() as keyof typeof brandImages];
};

// Vendor Suggestions View Component
const VendorSuggestionsView = ({ 
  vendorSuggestions, 
  onProductSelect,
  onAddToCart,
  cartVendor,
  onSuggestionClick
}: { 
  vendorSuggestions: VendorSuggestion[];
  onProductSelect: (product: Product) => void;
  onAddToCart: (product: Product, customizations: Record<string, any>) => void;
  cartVendor?: string;
  onSuggestionClick: (suggestion: SuggestionButton) => void;
}) => {
  const [activeVendor, setActiveVendor] = useState<string>('our-picks');
  const [showVendorStore, setShowVendorStore] = useState(false);
  const [selectedVendorForStore, setSelectedVendorForStore] = useState<VendorSuggestion | null>(null);
  
  // Create "Vetted Picks" as the first tab with top products from all vendors
  const vettedPicks = useMemo(() => {
    const allProducts = vendorSuggestions.flatMap(v => v.products);
    // Filter out products with no images and sort by rating
    return allProducts
      .filter(p => p.image && !p.image.includes('placeholder') && !p.image.includes('error'))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [vendorSuggestions]);

  // If cart has items from a specific vendor, show only that vendor's products
  const isSingleVendorMode = !!cartVendor;
  const singleVendorData = isSingleVendorMode ? vendorSuggestions.find(v => v.name === cartVendor) : null;

  const activeVendorData = isSingleVendorMode ? singleVendorData : vendorSuggestions.find(v => v.id === activeVendor);
  // Filter vendor products to only show those with valid images
  const vendorProductsFiltered = activeVendorData?.products.filter(p => 
    p.image && !p.image.includes('placeholder') && !p.image.includes('error')
  ) || [];
  const displayProducts = isSingleVendorMode ? vendorProductsFiltered : (activeVendor === 'our-picks' ? vettedPicks : vendorProductsFiltered);

  return (
    <div className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl self-start overflow-hidden">
      {/* Vendor Tabs - Hide when in single vendor mode */}
      {!isSingleVendorMode && (
        <div className="flex overflow-x-auto scrollbar-hide border-b border-[#2A2A2A] bg-[#1A1A1A]">
        {/* Our Picks Tab */}
        <button
          onClick={() => setActiveVendor('our-picks')}
          className={`flex-shrink-0 flex-grow-0 flex flex-col items-center py-3 px-1 transition-all duration-200 ${
            activeVendor === 'our-picks' 
              ? 'border-b-3 border-primary bg-primary/10 rounded-t-2xl' 
              : 'hover:bg-white/5'
          }`}
          style={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}
        >
             <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 ${
               activeVendor === 'our-picks' ? 'bg-primary/25 ring-[3px] ring-primary/50' : 'bg-white/15'
             }`}>
            <div className="w-12 h-12 rounded-md overflow-hidden bg-white shadow-sm">
              <img 
                src="https://files.slack.com/files-pri/T7SAV7LAD-F09KW1V1RK2/image.png?pub_secret=8c03d889a6" 
                alt="Our Picks"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Our Picks Title under logo */}
          <div className="mt-2 text-center">
            <div className={`text-xs font-medium leading-tight text-center ${
              activeVendor === 'our-picks' ? 'text-[#D4AF37]' : 'text-white'
            }`} style={{ 
              width: '70px', 
              minWidth: '70px', 
              maxWidth: '70px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...(activeVendor === 'our-picks' ? { color: '#D4AF37' } : {})
            }}>
              Our Picks
            </div>
          </div>
        </button>

        {/* Vendor Tabs */}
        {vendorSuggestions.map((vendor) => {
          // Get vendor-specific logo designs with real brand images
          const getVendorLogo = (vendorName: string, isActive: boolean) => {
            const brandImages = {
              'jeddah flowers': 'https://files.slack.com/files-pri/T7SAV7LAD-F09KQF5N0QG/screenshot_2025-10-05_at_10.41.41___pm.png?pub_secret=9a5b11cdce',
              'sweet delights': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JPR190HH/screenshot_2025-10-05_at_10.41.59___pm.png?pub_secret=ebda480cca',
              'party central': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JU4RGYNS/screenshot_2025-10-05_at_10.42.45___pm.png?pub_secret=b17ec4dbf0',
              'le jardin restaurant': 'https://files.slack.com/files-pri/T7SAV7LAD-F09JZPHDDPW/screenshot_2025-10-05_at_10.43.19___pm.png?pub_secret=5d0e2b51bd'
            };

            const brandImage = brandImages[vendorName.toLowerCase() as keyof typeof brandImages];
            
            if (brandImage) {
              return (
                <div className="w-12 h-12 rounded-md overflow-hidden bg-white shadow-sm">
                  <img 
                    src={brandImage} 
                    alt={vendorName}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            }

            // Fallback to gradient design for any vendors without images
            switch (vendorName.toLowerCase()) {
              case 'jeddah flowers':
                return (
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JF</span>
                  </div>
                );
              case 'sweet delights':
                return (
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SD</span>
                  </div>
                );
              case 'party central':
                return (
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PC</span>
                  </div>
                );
              case 'le jardin restaurant':
                return (
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">LJ</span>
                  </div>
                );
              default:
                return (
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                );
            }
          };

          return (
            <button
              key={vendor.id}
              onClick={() => setActiveVendor(vendor.id)}
              className={`flex-shrink-0 flex-grow-0 flex flex-col items-center py-3 px-1 transition-all duration-200 ${
                activeVendor === vendor.id 
                  ? 'border-b-3 border-primary bg-primary/10 rounded-t-2xl' 
                  : 'hover:bg-white/5'
              }`}
              style={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}
            >
                 <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 ${
                   activeVendor === vendor.id ? 'bg-primary/25 ring-[3px] ring-primary/50' : 'bg-white/15'
                 }`}>
                {getVendorLogo(vendor.name, activeVendor === vendor.id)}
              </div>
              {/* Vendor Title under logo */}
              <div className="mt-2 text-center">
                <div className="text-white text-xs font-medium leading-tight text-center" style={{
                  width: '70px',
                  minWidth: '70px', 
                  maxWidth: '70px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {vendor.name}
                </div>
              </div>
            </button>
          );
        })}
        </div>
      )}

      {/* Content Area - Enhanced Design */}
      <div>
        {/* Single Vendor Mode - Show vendor products with See All button */}
        {isSingleVendorMode && activeVendorData && (
          <div className="p-4 bg-[#1A1A1A]">
            {/* Grid Layout - Show 2 products per vendor */}
            <div className="space-y-3">
              {displayProducts.slice(0, 2).map((product) => (
                <DeliveryStyleProductCard
                  key={product.id}
                  product={product}
                  onSelect={onProductSelect}
                  onAddToCart={(product) => onAddToCart(product, {})}
                />
              ))}
            </div>
            
            {/* See All Button - Compact and subtle */}
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => {
                  setSelectedVendorForStore(activeVendorData);
                  setShowVendorStore(true);
                }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3D3B2E] hover:bg-[#4A4638] text-[#D4AF37] text-sm font-medium transition-all duration-200 border border-[#4A4638] hover:border-[#5A5648]"
              >
                <span>See all {activeVendorData.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* Our Picks Content - Horizontal Scroll */}
        {!isSingleVendorMode && activeVendor === 'our-picks' && (
          <div className="p-4">
            
            {/* Horizontal Scrollable Products */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-3 snap-x snap-mandatory">
                {displayProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 snap-start">
                    <CompactProductCard
                      product={product}
                      onSelect={onProductSelect}
                      onAddToCart={(product) => onAddToCart(product, {})}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Reply Buttons - Inside Our Picks */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onSuggestionClick({ id: 'refine-premium', label: 'Show premium or curated gifts', searchQuery: 'Show me premium or curated gift options' })}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-all duration-200"
              >
                Show premium or curated gifts
              </button>
              <button
                onClick={() => onSuggestionClick({ id: 'refine-budget', label: 'Refine by budget or style', searchQuery: 'Find gifts by budget or style preferences' })}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-all duration-200"
              >
                Refine by budget or style
              </button>
              <button
                onClick={() => onSuggestionClick({ id: 'refine-personal', label: 'Make it more personal', searchQuery: 'Find personalized or custom gift options' })}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-all duration-200"
              >
                Make it more personal
              </button>
            </div>
          </div>
        )}

        {/* Vendor-specific Content - Grid Layout like Delivery Apps */}
        {!isSingleVendorMode && activeVendor !== 'our-picks' && activeVendorData && (
          <div className="p-4 bg-[#1A1A1A]">
            
            {/* Grid Layout - Show 2 products per vendor */}
            <div className="space-y-3">
              {displayProducts.slice(0, 2).map((product) => (
                <DeliveryStyleProductCard
                  key={product.id}
                  product={product}
                  onSelect={onProductSelect}
                  onAddToCart={(product) => onAddToCart(product, {})}
                />
              ))}
            </div>
            
            {/* See All Button - Compact and subtle */}
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => {
                  setSelectedVendorForStore(activeVendorData);
                  setShowVendorStore(true);
                }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3D3B2E] hover:bg-[#4A4638] text-[#D4AF37] text-sm font-medium transition-all duration-200 border border-[#4A4638] hover:border-[#5A5648]"
              >
                <span>See all {activeVendorData.name}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Vendor Store Bottom Sheet */}
      {selectedVendorForStore && (
        <VendorStoreSheet
          isOpen={showVendorStore}
          onClose={() => {
            setShowVendorStore(false);
            setSelectedVendorForStore(null);
          }}
          vendorName={selectedVendorForStore.name}
          vendorDescription={selectedVendorForStore.description || ''}
          vendorLogo={getVendorLogoUrl(selectedVendorForStore.name)}
          products={selectedVendorForStore.products}
          onProductSelect={(product) => {
            setShowVendorStore(false);
            setSelectedVendorForStore(null);
            onProductSelect(product);
          }}
          onAddToCart={(product) => {
            onAddToCart(product, {});
          }}
        />
      )}
    </div>
  );
};

function AIChatComponent({ cartCount, cartVendor, cartItems, onAddToCart, onUpdateQuantity, onRemoveItem, onCheckout }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [showCartPopup, setShowCartPopup] = useState(false);

  // Voice recording state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const [conversationContext, setConversationContext] = useState<{
    clickedSuggestions: string[];
    searchQueries: string[];
    shownProducts: string[];
    conversationDepth: number;
    lastCategory: string;
    userPreferences: string[];
    interactionCount: number;
    discoveryPhase: boolean; // New: tracks if we're still in discovery phase
    firstButtonClicked: boolean; // New: tracks if user has clicked first button
  }>({
    clickedSuggestions: [],
    searchQueries: [],
    shownProducts: [],
    conversationDepth: 0,
    lastCategory: '',
    userPreferences: [],
    interactionCount: 0,
    discoveryPhase: true,
    firstButtonClicked: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Debounce scroll to prevent excessive scrolling during rapid message updates
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // No auto-discovery - let users initiate the conversation

  // Voice recording handlers
  const handleVoiceRecorderSend = (transcript: string) => {
    // Add voice message with special indicator
    const voiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript,
      timestamp: new Date(),
      isVoiceMessage: true
    };

    setMessages(prev => [...prev, voiceMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowPrompts(false);

    // Continue with AI response (copy the logic from handleSendMessage but without adding the user message again)
    setTimeout(() => {
      const availableProducts = (cartVendor 
        ? mockProducts.filter(product => product.vendor === cartVendor)
        : getSmartProductSelection(transcript, conversationContext)
      ).filter(p => p.image && !p.image.includes('placeholder') && !p.image.includes('error'));

      const { content, suggestions, searchContext } = getAIResponseWithSuggestions(transcript);
      
      setConversationContext(prev => ({
        ...prev,
        lastCategory: searchContext,
        conversationDepth: 0,
        searchQueries: [...prev.searchQueries, transcript],
        interactionCount: prev.interactionCount + 1,
        userPreferences: [...prev.userPreferences, ...extractPreferences(transcript)]
      }));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cartVendor 
          ? `Here's more from ${cartVendor}:`
          : content,
        timestamp: new Date(),
        vendorSuggestions: createVendorSuggestions(),
        suggestions: cartVendor ? undefined : suggestions,
        searchContext: cartVendor ? undefined : searchContext
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleMicClick = () => {
    setShowVoiceRecorder(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Update conversation context for regular messages (not suggestion clicks)
    const isFromSuggestion = conversationContext.searchQueries.includes(message);
    if (!isFromSuggestion) {
      setConversationContext(prev => ({
        ...prev,
        conversationDepth: 0, // Reset depth for new user queries
        searchQueries: [...prev.searchQueries, message],
        interactionCount: prev.interactionCount + 1,
        // Extract user preferences from message
        userPreferences: [...prev.userPreferences, ...extractPreferences(message)]
      }));
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowPrompts(false);

    // Simulate AI response
    setTimeout(() => {
      // Check if user is asking for suggestions/recommendations
      const isAskingForSuggestions = /suggest|recommend|show me|what do you have|options|vendors|brands|stores/i.test(message);
      
      // Filter products by cart vendor if cart has items, and remove products without images
      const availableProducts = (cartVendor 
        ? mockProducts.filter(product => product.vendor === cartVendor)
        : getSmartProductSelection(message, conversationContext)
      ).filter(p => p.image && !p.image.includes('placeholder') && !p.image.includes('error'));

      const { content, suggestions, searchContext } = getAIResponseWithSuggestions(message);
      
      // Update context with current category
      setConversationContext(prev => ({
        ...prev,
        lastCategory: searchContext
      }));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cartVendor 
          ? `Here's more from ${cartVendor}:`
          : content,
        timestamp: new Date(),
        // Always show vendor suggestions (tab style)
        vendorSuggestions: createVendorSuggestions(),
        suggestions: cartVendor ? undefined : suggestions,
        searchContext: cartVendor ? undefined : searchContext
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Helper function to extract user preferences from messages
  const extractPreferences = (message: string): string[] => {
    const preferences: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Extract price preferences
    if (lowerMessage.includes('cheap') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
      preferences.push('budget-friendly');
    }
    if (lowerMessage.includes('luxury') || lowerMessage.includes('premium') || lowerMessage.includes('expensive')) {
      preferences.push('luxury');
    }
    
    // Extract delivery preferences  
    if (lowerMessage.includes('same day') || lowerMessage.includes('urgent') || lowerMessage.includes('today')) {
      preferences.push('same-day-delivery');
    }
    
    // Extract style preferences
    if (lowerMessage.includes('modern') || lowerMessage.includes('contemporary')) {
      preferences.push('modern');
    }
    if (lowerMessage.includes('traditional') || lowerMessage.includes('classic')) {
      preferences.push('traditional');
    }
    
    return preferences;
  };

  // Smart product selection based on conversation history
  const getSmartProductSelection = (message: string, context: typeof conversationContext): Product[] => {
    const lowerMessage = message.toLowerCase();
    
    let products: Product[] = [];
    
    // Category-specific product filtering for main buttons
    if (lowerMessage.includes('trending gifts') || lowerMessage.includes('show trending')) {
      // Top rated products - ensure we have at least 6
      products = mockProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, Math.min(6, mockProducts.length));
    } else if (lowerMessage.includes('seasonal') || lowerMessage.includes('special')) {
      // Mix of different categories for seasonal appeal
      products = [
        mockProducts.find(p => p.name.includes('Rose')),
        mockProducts.find(p => p.name.includes('Chocolate')),
        mockProducts.find(p => p.name.includes('Cake')),
        mockProducts.find(p => p.name.includes('Dining')),
        mockProducts.find(p => p.name.includes('Balloon')),
        mockProducts.find(p => p.name.includes('Perfume'))
      ].filter(Boolean) as Product[];
      
      // Fill with other products if not enough
      if (products.length < 6) {
        const remaining = mockProducts.filter(p => !products.includes(p)).slice(0, 6 - products.length);
        products = [...products, ...remaining];
      }
    } else if (lowerMessage.includes('local favorites') || lowerMessage.includes('jeddah')) {
      // Focus on dining and traditional gifts
      products = mockProducts.filter(p => 
        p.name.includes('Dining') || 
        p.name.includes('Restaurant') || 
        p.vendor.includes('Jeddah') ||
        p.name.includes('Rose') ||
        p.name.includes('Gold')
      ).slice(0, 6);
      
      // Fill with other products if not enough
      if (products.length < 6) {
        const remaining = mockProducts.filter(p => !products.includes(p)).slice(0, 6 - products.length);
        products = [...products, ...remaining];
      }
    } else {
      // Default smart selection for other queries - always show 6 products
      const offset = (context.interactionCount * 2) % mockProducts.length;
      products = [
        ...mockProducts.slice(offset),
        ...mockProducts.slice(0, offset)
      ].slice(0, 6);
    }
    
    // Ensure we always have at least 5 products minimum
    if (products.length < 5) {
      products = mockProducts.slice(0, Math.min(6, mockProducts.length));
    }
    
    return products;
  };

  const getSmartSuggestions = (category: string, context: typeof conversationContext): SuggestionButton[] => {
    const { clickedSuggestions, conversationDepth, interactionCount, userPreferences } = context;
    
    // Dynamic suggestion pools based on category and conversation progress
    const suggestionPools = {
      birthday: [
        // First interaction suggestions
        { id: 'birthday-age-specific', label: 'Show age-specific gifts', searchQuery: 'Birthday gifts by age group' },
        { id: 'birthday-surprise', label: 'Show surprise packages', searchQuery: 'Birthday surprise gift packages' },
        { id: 'birthday-themed', label: 'Show themed parties', searchQuery: 'Themed birthday celebration packages' },
        
        // Follow-up suggestions
        { id: 'birthday-memories', label: 'Show memory keepsakes', searchQuery: 'Personalized birthday keepsake gifts' },
        { id: 'birthday-experience', label: 'Show experiences', searchQuery: 'Birthday experience gifts Jeddah' },
        { id: 'birthday-luxury', label: 'Show premium options', searchQuery: 'Luxury birthday gifts and celebrations' },
        
        // Deep conversation suggestions
        { id: 'birthday-custom', label: 'Create custom package', searchQuery: 'Custom birthday gift combinations' },
        { id: 'birthday-delivery', label: 'Same-day delivery', searchQuery: 'Same-day birthday gift delivery' },
        { id: 'birthday-budget', label: 'Show budget options', searchQuery: 'Affordable birthday gift ideas' }
      ],
      
      anniversary: [
        { id: 'anniversary-romantic', label: 'Show romantic setups', searchQuery: 'Romantic anniversary dinner setups' },
        { id: 'anniversary-milestone', label: 'Show milestone gifts', searchQuery: 'Anniversary milestone celebration gifts' },
        { id: 'anniversary-couples', label: 'Show couple experiences', searchQuery: 'Couple experience gifts in Jeddah' },
        
        { id: 'anniversary-jewelry', label: 'Show jewelry options', searchQuery: 'Anniversary jewelry and accessories' },
        { id: 'anniversary-spa', label: 'Show spa packages', searchQuery: 'Couple spa packages for anniversary' },
        { id: 'anniversary-getaway', label: 'Show staycation deals', searchQuery: 'Anniversary staycation packages Jeddah' },
        
        { id: 'anniversary-surprise', label: 'Plan surprise celebration', searchQuery: 'Surprise anniversary celebration planning' },
        { id: 'anniversary-photos', label: 'Add photo session', searchQuery: 'Anniversary photo session packages' }
      ],
      
      graduation: [
        { id: 'graduation-achievement', label: 'Show achievement gifts', searchQuery: 'Graduation achievement celebration gifts' },
        { id: 'graduation-future', label: 'Show career-starter gifts', searchQuery: 'Career starter graduation gifts' },
        { id: 'graduation-party', label: 'Show party packages', searchQuery: 'Graduation party celebration packages' },
        
        { id: 'graduation-tech', label: 'Show tech gifts', searchQuery: 'Tech gifts for new graduates' },
        { id: 'graduation-professional', label: 'Show professional items', searchQuery: 'Professional graduation gifts' },
        { id: 'graduation-memory', label: 'Show memory books', searchQuery: 'Graduation memory books and keepsakes' }
      ],
      
      flowers: [
        { id: 'flowers-seasonal', label: 'Show seasonal blooms', searchQuery: 'Seasonal flower arrangements available now' },
        { id: 'flowers-occasion', label: 'Show by occasion', searchQuery: 'Flower arrangements by specific occasions' },
        { id: 'flowers-colors', label: 'Show by color theme', searchQuery: 'Flower arrangements by color preferences' },
        
        { id: 'flowers-exotic', label: 'Show exotic varieties', searchQuery: 'Exotic and rare flower arrangements' },
        { id: 'flowers-subscription', label: 'Show subscriptions', searchQuery: 'Weekly flower subscription services' },
        { id: 'flowers-corporate', label: 'Show office arrangements', searchQuery: 'Corporate office flower arrangements' }
      ],
      
      general: [
        { id: 'trending-now', label: 'Show trending gifts', searchQuery: 'Most trending gifts this month in Jeddah' },
        { id: 'seasonal-special', label: 'Show seasonal specials', searchQuery: 'Current seasonal gift specials' },
        { id: 'local-favorites', label: 'Show local favorites', searchQuery: 'Most loved gifts by Jeddah residents' },
        
        { id: 'quick-delivery', label: 'Show quick delivery', searchQuery: 'Gifts available for same-day delivery' },
        { id: 'bundle-deals', label: 'Show combo deals', searchQuery: 'Gift combination packages and deals' },
        { id: 'eco-friendly', label: 'Show eco options', searchQuery: 'Eco-friendly and sustainable gift options' }
      ]
    };

    // Get relevant pool or fallback to general
    const pool = suggestionPools[category as keyof typeof suggestionPools] || suggestionPools.general;
    
    // Filter out already clicked suggestions
    const availableSuggestions = pool.filter(s => !clickedSuggestions.includes(s.id));
    
    // If we've exhausted category suggestions, mix with other categories
    if (availableSuggestions.length < 3) {
      const otherCategories = Object.keys(suggestionPools).filter(k => k !== category);
      const mixedSuggestions = otherCategories.flatMap(cat => 
        suggestionPools[cat as keyof typeof suggestionPools].filter(s => !clickedSuggestions.includes(s.id))
      );
      availableSuggestions.push(...mixedSuggestions);
    }
    
    // Select suggestions based on conversation depth
    let selectedSuggestions: SuggestionButton[] = [];
    
    if (conversationDepth === 0) {
      // First interaction - show broad category suggestions
      selectedSuggestions = availableSuggestions.slice(0, 3);
    } else if (conversationDepth === 1) {
      // Second interaction - show more specific options
      selectedSuggestions = availableSuggestions.slice(3, 6);
    } else {
      // Deep conversation - show specialized and mixed options
      selectedSuggestions = availableSuggestions.slice(6, 9);
      
      // If we don't have enough, add from beginning with preference for unexplored
      if (selectedSuggestions.length < 3) {
        const remaining = availableSuggestions.slice(0, 3 - selectedSuggestions.length);
        selectedSuggestions.push(...remaining);
      }
    }
    
    // Ensure we always have 3 suggestions
    while (selectedSuggestions.length < 3 && availableSuggestions.length > selectedSuggestions.length) {
      const remaining = availableSuggestions.filter(s => !selectedSuggestions.includes(s));
      if (remaining.length > 0) {
        selectedSuggestions.push(remaining[0]);
      } else {
        break;
      }
    }
    
    return selectedSuggestions.slice(0, 3);
  };

  const getAIResponseWithSuggestions = (userMessage: string): { content: string, suggestions: SuggestionButton[], searchContext: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Determine category and update context
    let category = 'general';
    let responseContent = "I've found some wonderful options for you:";
    
    // Special responses for main category buttons
    if (lowerMessage.includes('trending gifts') || lowerMessage.includes('show trending')) {
      category = 'trending';
      responseContent = "Here are the most popular gifts in Jeddah right now:";
    } else if (lowerMessage.includes('seasonal') || lowerMessage.includes('special')) {
      category = 'seasonal';
      responseContent = "Check out these seasonal specials perfect for this time of year:";
    } else if (lowerMessage.includes('local favorites') || lowerMessage.includes('jeddah favorites')) {
      category = 'local';
      responseContent = "These are the most loved gifts by Jeddah residents:";
    } else if (lowerMessage.includes('birthday')) {
      category = 'birthday';
      responseContent = "Perfect! Here are some wonderful birthday gift options:";
    } else if (lowerMessage.includes('anniversary')) {
      category = 'anniversary';
      responseContent = "How romantic! Here are beautiful anniversary gifts:";
    } else if (lowerMessage.includes('graduation')) {
      category = 'graduation';
      responseContent = "Congratulations! Here are perfect graduation celebration gifts:";
    } else if (lowerMessage.includes('flower') || lowerMessage.includes('bouquet')) {
      category = 'flowers';
      responseContent = "Beautiful choice! Here are our stunning flower arrangements:";
    }

    // Only show suggestions if we're still in discovery phase AND it's not a main category button click
    const isMainCategoryButton = ['trending gifts', 'seasonal', 'local favorites'].some(term => 
      lowerMessage.includes(term)
    );
    
    let suggestions: SuggestionButton[] = [];
    
    // Only show suggestions in discovery phase and NOT after main category buttons
    if (conversationContext.discoveryPhase && !conversationContext.firstButtonClicked) {
      suggestions = getSmartSuggestions(category, conversationContext);
    }
    
    return {
      content: responseContent,
      suggestions,
      searchContext: category
    };
  };

  const handlePromptClick = (prompt: typeof predefinedPrompts[0]) => {
    // When user clicks a prompt from the welcome screen, we exit discovery mode
    setConversationContext(prev => ({
      ...prev,
      discoveryPhase: false,
      firstButtonClicked: true,
      interactionCount: prev.interactionCount + 1
    }));
    setShowPrompts(false);
    handleSendMessage(prompt.query);
  };
  
  // Handle direct user input (when they start typing)
  const handleUserInput = (message: string) => {
    // Hide prompts when user starts typing
    setShowPrompts(false);
    setConversationContext(prev => ({
      ...prev,
      discoveryPhase: false,
      firstButtonClicked: true
    }));
    handleSendMessage(message);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product, customizations: Record<string, any>) => {
    onAddToCart(product, customizations);
    setSelectedProduct(null);
    
    // Add post-cart AI message with quick actions
    const postCartMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Great! I've added ${product.name} to your cart (${cartCount + 1} items total). What would you like to do next?`,
      timestamp: new Date(),
      quickActions: [
        { id: 'continue', label: 'Continue Shopping', action: 'continue_shopping' },
        { id: 'checkout', label: `Checkout Now (${cartCount + 1})`, action: 'view_cart' }
      ]
    };

    setMessages(prev => [...prev, postCartMessage]);
  };

  const handleSuggestionClick = (suggestion: SuggestionButton) => {
    // Check if this is one of the main category buttons
    const isMainCategoryButton = ['trending', 'seasonal', 'local-favorites'].includes(suggestion.id);
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      clickedSuggestions: [...prev.clickedSuggestions, suggestion.id],
      searchQueries: [...prev.searchQueries, suggestion.searchQuery],
      conversationDepth: prev.conversationDepth + 1,
      interactionCount: prev.interactionCount + 1,
      // Mark that we've moved past discovery phase after first main button click
      discoveryPhase: isMainCategoryButton ? false : prev.discoveryPhase,
      firstButtonClicked: isMainCategoryButton ? true : prev.firstButtonClicked
    }));
    
    handleSendMessage(suggestion.searchQuery);
  };

  const handleQuickAction = (action: QuickAction['action']) => {
    switch (action) {
      case 'continue_shopping':
        // Filter products by cart vendor if cart has items, and remove products without images
        const allProducts = cartVendor 
          ? mockProducts.filter(product => product.vendor === cartVendor)
          : mockProducts.slice(1, 7);
        const availableProducts = allProducts
          .filter(p => p.image && !p.image.includes('placeholder') && !p.image.includes('error'))
          .slice(0, 6); // Show 6 products
        
        const continueMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: cartVendor 
            ? `Here's more from ${cartVendor}:`
            : "What else would you like?",
          timestamp: new Date(),
          vendorSuggestions: createVendorSuggestions()
        };
        setMessages(prev => [...prev, continueMessage]);
        break;
      case 'view_cart':
        setShowCartPopup(true);
        break;
      case 'checkout':
        onCheckout();
        break;
    }
  };

  return (
    <div className="flex flex-col h-full dark bg-background relative overflow-hidden">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Powered by AskAI - Left aligned */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide uppercase">Powered by</span>
              <span className="text-sm font-semibold text-white tracking-tight">AskAI</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCartPopup(true)}
            className="relative p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Welcome Landing Interface - Only show when there are no messages */}
      {messages.length === 0 && showPrompts && (
        <div className="flex-1 flex flex-col animate-in fade-in duration-700">
          {/* Hero Section - Top positioned */}
          <div className="text-center pt-6 pb-4">
            <div className="mb-4 mt-8">
               <h1 className="text-2xl font-semibold text-white mb-2 animate-in slide-in-from-bottom duration-500 delay-150">
                  Find the perfect gift
                </h1>
                <p className="text-[#776f69] text-base leading-relaxed max-w-[280px] mx-auto animate-in slide-in-from-bottom duration-500 delay-300">
                  Tell me what you're celebrating, and I'll help you find something special
                </p>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="flex-1 py-4">
            <div className="animate-in slide-in-from-bottom duration-500 delay-400">
              <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ padding: '0 20px' }}>
                {predefinedPrompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="group relative cursor-pointer animate-in slide-in-from-bottom duration-500 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03]"
                    style={{ 
                      width: '180px',
                      height: '140px',
                      flexShrink: 0,
                      animationDelay: `${500 + index * 100}ms`
                    }}
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {/* Image */}
                    <ImageWithFallback
                      src={prompt.image}
                      alt={prompt.title}
                      className="absolute top-0 left-0 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      style={{ width: '100%', height: '100%' }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div 
                      className="absolute bottom-0 left-0 pointer-events-none"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)'
                      }}
                    />
                    
                    {/* Text */}
                    <div 
                      className="absolute"
                      style={{ 
                        bottom: '12px',
                        left: '12px',
                        right: '12px',
                        zIndex: 10
                      }}
                    >
                      <h4 className="text-white text-[15px] font-semibold leading-snug" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                        {prompt.title}
                      </h4>
                    </div>
                    
                    {/* Animated glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Messages - Show when there are messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-[100px]">
        {messages.length > 0 && messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} flex-col space-y-3`}>
            {/* Text Content Bubble */}
            <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-gradient-to-br from-primary/90 to-primary text-primary-foreground' : 'bg-[#1F1F1F] border border-[#2A2A2A]'} rounded-2xl ${message.role === 'user' ? 'px-3 py-2' : 'px-4 py-3'} ${message.role === 'user' ? 'self-end' : 'self-start'} ${message.role === 'user' ? 'w-fit' : ''}`}>
              <div className="flex items-start gap-2">
                {message.isVoiceMessage && message.role === 'user' && (
                  <Mic className="w-4 h-4 mt-0.5 text-primary-foreground/80 shrink-0" />
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              
              {/* Quick action buttons - inside text bubble */}
              {message.quickActions && (
                <div className="flex flex-col gap-3 mt-4">
                  {message.quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.action === 'checkout' ? 'default' : action.action === 'view_cart' ? 'outline' : 'ghost'}
                      size="default"
                      onClick={() => handleQuickAction(action.action)}
                      className={`w-full justify-center py-3 rounded-xl transition-all duration-200 ${
                        action.action === 'checkout' 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20' 
                          : action.action === 'view_cart'
                          ? 'border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Vendor Suggestions - Assistant only */}
            {message.vendorSuggestions && message.role === 'assistant' && (
              <VendorSuggestionsView 
                vendorSuggestions={message.vendorSuggestions}
                onProductSelect={handleProductSelect}
                onAddToCart={handleAddToCart}
                cartVendor={cartVendor}
                onSuggestionClick={handleSuggestionClick}
              />
            )}

          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl px-4 py-3 max-w-[75%] self-start">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="fixed bottom-[72px] left-0 right-0 z-30 bg-background">
        <div className="flex gap-3 items-center px-4 py-3">
          <div className="relative flex-1 rounded-[40px] transition-all duration-300 shadow-lg shadow-primary/10">
            <div className="flex flex-row items-center overflow-clip size-full">
              <div className="flex gap-3 items-center px-6 py-3 relative w-full">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && inputValue.trim() && handleUserInput(inputValue)}
                  placeholder={
                    messages.length === 0 
                      ? "Ask me anything..."
                      : "Ask me anything..."
                  }
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder:text-[#776f69] outline-none transition-all duration-300"
                />
                
                {/* Show microphone when input is empty, send button when typing */}
                {!inputValue.trim() ? (
                  <button 
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className="relative shrink-0 size-[32px] rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 text-muted-foreground hover:text-primary hover:scale-105"
                    title="Tap to record voice message"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUserInput(inputValue)}
                    disabled={isLoading}
                    className="relative shrink-0 size-[32px] rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 opacity-70 hover:opacity-100 hover:scale-105"
                  >
                    <Send className="w-5 h-5 text-primary" />
                  </button>
                )}
              </div>
            </div>
            <div className="absolute border border-solid inset-0 pointer-events-none rounded-[30px] transition-colors duration-300 border-primary/20" />
          </div>
        </div>
      </div>

      {/* Item Detail Bottom Sheet */}
      <ItemDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed inset-0 z-50">
          <CartView
            items={cartItems}
            onClose={() => setShowCartPopup(false)}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onContinueShopping={() => setShowCartPopup(false)}
            onCheckout={() => {
              setShowCartPopup(false);
              onCheckout();
            }}
          />
        </div>
      )}

      {/* Voice Recorder */}
      <VoiceRecorder
        isVisible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSend={handleVoiceRecorderSend}
      />

    </div>
  );
}

export const AIChat = memo(AIChatComponent);