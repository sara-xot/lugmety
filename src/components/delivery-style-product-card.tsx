import React from 'react';

interface Product {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image: string;
  description?: string;
}

interface DeliveryStyleProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  className?: string;
}

export function DeliveryStyleProductCard({ 
  product, 
  onSelect, 
  onAddToCart, 
  className = '' 
}: DeliveryStyleProductCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className={`bg-card border border-border rounded-3xl p-4 cursor-pointer hover:bg-[#1F1F1F] transition-all duration-200 ${className}`}
      onClick={() => onSelect(product)}
    >
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#2A2A2A]">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-white/60 text-xs leading-tight mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold text-sm">
              {product.price} SAR
            </span>
          </div>
        </div>
        
        {/* Add Button */}
        <button
          onClick={handleAddClick}
          className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#252525] active:scale-95 transition-all duration-200 flex items-center justify-center p-1.5"
        >
          <span className="text-[#D4AF37] text-xl font-light leading-none">+</span>
        </button>
      </div>
    </div>
  );
}
