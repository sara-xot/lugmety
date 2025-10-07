import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RiyalSymbol } from './riyal-symbol';

interface Product {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  customizationOptions: any[];
}

interface CompactProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  className?: string;
}

export function CompactProductCard({ product, onSelect, onAddToCart, className = '' }: CompactProductCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className={`bg-card border border-border rounded-3xl p-4 w-[72vw] max-w-[260px] min-w-[240px] flex-shrink-0 relative cursor-pointer hover:bg-[#1F1F1F] transition-all duration-200 ${className}`}
      style={{ height: '332px' }}
      onClick={() => onSelect(product)}
    >
      {/* Product Image */}
      <div className="rounded-2xl overflow-hidden mb-4 bg-muted" style={{ height: '180px' }}>
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="space-y-3">
        {/* Product Name and Vendor - Grouped */}
        <div className="space-y-0.5">
          <h4 className="font-medium line-clamp-2 leading-none">
            {product.name}
          </h4>
          <p className="text-muted-foreground font-medium truncate">
            {product.vendor}
          </p>
        </div>
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-primary">
            <RiyalSymbol size="sm" />
            <span className="font-semibold">{product.price}</span>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddClick}
            className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#252525] active:scale-95 transition-all duration-200 flex items-center justify-center p-1.5"
          >
            <span className="text-[#D4AF37] text-xl font-light leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}