import { useState } from 'react';
import { ArrowLeft, ChevronLeft, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RiyalSymbol } from './riyal-symbol';
import exampleEmptyCart from 'figma:asset/ee99ad6a0f037d9c1a680640166cd487bb25dd5f.png';

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

interface CartViewProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export function CartView({ 
  items, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem, 
  onContinueShopping,
  onCheckout 
}: CartViewProps) {
  const [promoCode, setPromoCode] = useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleApplyPromo = () => {
    // Handle promo code logic here
    console.log('Apply promo:', promoCode);
  };

  const handleClearAll = () => {
    items.forEach(item => onRemoveItem(item.id));
  };

  const formatCustomizations = (customizations: Record<string, any>) => {
    return Object.entries(customizations)
      .filter(([key]) => key !== 'quantity')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendor]) {
      acc[item.vendor] = [];
    }
    acc[item.vendor].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  if (items.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-medium text-primary">Cart</h1>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary rounded-sm"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">0</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-primary font-medium">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium text-primary">Cart</h1>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleClearAll}
          className="text-primary hover:text-primary/80"
        >
          Clear All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Estimated Delivery */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">Estimated Delivery</span>
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-black font-medium">i</span>
                  </div>
                </div>
                <p className="font-medium text-foreground">Now (25-35 Mins)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Estimated delivery time may not reflect actual deliver time due to ordered items and restaurant pressure
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Sections */}
          {Object.entries(itemsByVendor).map(([vendor, vendorItems]) => (
            <div key={vendor} className="space-y-4">
              <h2 className="text-lg font-medium text-primary">{vendor}</h2>
              
              {/* Items */}
              {vendorItems.map((item, index) => (
                <div key={item.id} className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    {/* Item Number Badge */}
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs font-medium text-black">{index + 1}</span>
                    </div>
                    
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      {formatCustomizations(item.customizations) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCustomizations(item.customizations)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <RiyalSymbol size="sm" />
                        <span className="font-medium text-foreground">{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-primary/30"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-primary/30"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add More Items */}
              <Button
                variant="ghost"
                onClick={onContinueShopping}
                className="w-full py-4 text-primary hover:text-primary/80 border border-dashed border-border rounded-2xl"
              >
                + Add More Items
              </Button>
            </div>
          ))}

          {/* Promo Code */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Promo code</h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-dashed border-primary rounded flex items-center justify-center">
                    <span className="text-xs text-primary">%</span>
                  </div>
                </div>
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter your promo code..."
                  className="pl-12 bg-card border-border rounded-2xl h-12"
                />
              </div>
              <Button 
                onClick={handleApplyPromo}
                disabled={!promoCode.trim()}
                className="px-6 h-12 rounded-2xl bg-primary text-black hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sub Total</span>
              <div className="flex items-center gap-2">
                <RiyalSymbol size="sm" />
                <span className="font-medium">{subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <div className="flex items-center gap-2">
                <RiyalSymbol size="sm" />
                <span className="font-medium">{tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="h-px bg-border"></div>
            
            <div className="flex justify-between">
              <div>
                <span className="text-primary font-medium">Grand Total</span>
                <span className="text-xs text-muted-foreground ml-2">(incl vat)</span>
              </div>
              <div className="flex items-center gap-2">
                <RiyalSymbol size="md" />
                <span className="font-semibold text-lg">{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Checkout Button */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={onCheckout}
          className="w-full h-12 rounded-2xl bg-primary text-black hover:bg-primary/90 font-medium"
        >
          Proceed to checkout
        </Button>
      </div>
    </div>
  );
}