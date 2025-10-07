import React from 'react';
import { X } from 'lucide-react';
import { DeliveryStyleProductCard } from './delivery-style-product-card';

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

interface VendorStoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  vendorDescription: string;
  vendorLogo?: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function VendorStoreSheet({
  isOpen,
  onClose,
  vendorName,
  vendorDescription,
  vendorLogo,
  products,
  onProductSelect,
  onAddToCart
}: VendorStoreSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 top-[10vh] bottom-0 z-50 bg-background rounded-t-3xl animate-in slide-in-from-bottom duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border rounded-t-3xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          
          <div className="px-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Vendor Logo */}
                {vendorLogo && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                    <img 
                      src={vendorLogo} 
                      alt={vendorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {vendorName}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {vendorDescription}
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Products List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3 pb-6">
            {products.map((product) => (
              <DeliveryStyleProductCard
                key={product.id}
                product={product}
                onSelect={onProductSelect}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
