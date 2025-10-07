import { useState } from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription } from './ui/drawer';
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
  customizationOptions: CustomizationOption[];
}

interface CustomizationOption {
  id: string;
  name: string;
  type: 'select' | 'text' | 'number';
  required: boolean;
  options?: string[];
}

interface ItemDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customizations: Record<string, any>) => void;
}

export function ItemDetailModal({ product, isOpen, onClose, onAddToCart }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleCustomizationChange = (optionId: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const isValidForm = () => {
    if (!product) return false;
    return product.customizationOptions
      .filter(opt => opt.required)
      .every(opt => customizations[opt.id]);
  };

  const calculatePrice = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  const handleAddToCart = async () => {
    if (!product || !isValidForm()) return;
    
    setIsAdding(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onAddToCart(product, { ...customizations, quantity });
      setIsAdding(false);
      onClose();
    }, 500);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh] rounded-t-[24px] flex flex-col bg-black">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{product.name} - Product Details</DrawerTitle>
          <DrawerDescription>Product details and customization options for {product.name}</DrawerDescription>
        </DrawerHeader>
        
        {/* Product Image Section - Purple Background */}
        <div className="bg-gradient-to-br from-purple-300 to-purple-400 relative flex-shrink-0 h-[280px] flex items-center justify-center">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-auto h-[200px] object-contain drop-shadow-lg"
          />
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Favorite Button */}
          <button className="absolute bottom-4 left-4 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors z-10">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Section - Dark Background */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-black">
          <div className="p-6 space-y-4">
            {/* Product Name and Price */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#D4AF37]">{product.name}</h2>
              <div className="flex items-center gap-1 text-2xl font-bold text-[#D4AF37]">
                <RiyalSymbol size="lg" />
                {product.price}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed text-sm">
              {product.description}
            </p>

            {/* Separator Line */}
            <div className="border-t border-gray-600 my-4"></div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <h3 className="text-white font-medium">Special Instructions</h3>
              <Textarea
                placeholder="Add your notes..."
                className="bg-gray-800 border-gray-600 text-gray-300 placeholder-gray-500 rounded-lg resize-none"
                rows={3}
              />
            </div>

            {/* Customization Options */}
            {product.customizationOptions.length > 0 && (
              <div className="space-y-4">
                {product.customizationOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <h3 className="text-white font-medium">
                      {option.name}
                      {option.required && <span className="text-red-400 ml-1">*</span>}
                    </h3>

                    {option.type === 'select' && option.options && (
                      <div className="space-y-2">
                        {option.options.map((optionValue) => {
                          const isSelected = customizations[option.id] === optionValue;
                          return (
                            <div
                              key={optionValue}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                  : 'border-gray-600 bg-gray-800 hover:border-[#D4AF37]/50'
                              }`}
                              onClick={() => handleCustomizationChange(option.id, optionValue)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-[#D4AF37] bg-[#D4AF37]'
                                    : 'border-gray-500'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                  )}
                                </div>
                                <span className={`${isSelected ? 'text-[#D4AF37] font-medium' : 'text-gray-300'}`}>
                                  {optionValue}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {option.type === 'text' && (
                      <Textarea
                        value={customizations[option.id] || ''}
                        onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
                        placeholder={`Enter ${option.name.toLowerCase()}`}
                        className="bg-gray-800 border-gray-600 text-gray-300 placeholder-gray-500"
                        rows={3}
                      />
                    )}

                    {option.type === 'number' && (
                      <Input
                        type="number"
                        value={customizations[option.id] || ''}
                        onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
                        placeholder={`Enter ${option.name.toLowerCase()}`}
                        className="bg-gray-800 border-gray-600 text-gray-300 placeholder-gray-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions - Quantity and Add to Cart */}
        <div className="p-6 bg-black border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-lg bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-white min-w-[2rem] text-center text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-lg bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="flex-1 h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#9A7B1A] text-white shadow-lg"
              onClick={handleAddToCart}
              disabled={!isValidForm() || isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}