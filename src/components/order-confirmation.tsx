import { CheckCircle, Package, Clock, Share2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface OrderConfirmationProps {
  orderId: string;
  estimatedDelivery: string;
  total: number;
  onContinueShopping: () => void;
  onTrackOrder: () => void;
  onViewAllOrders: () => void;
}

export function OrderConfirmation({ 
  orderId, 
  estimatedDelivery, 
  total,
  onContinueShopping,
  onTrackOrder,
  onViewAllOrders 
}: OrderConfirmationProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Lugmety Order',
        text: `I just placed order ${orderId} on Lugmety! 🎁`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Order ${orderId} - ${window.location.href}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Success Animation Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-2 border-green-200 dark:border-green-800 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-green-300 dark:border-green-700 animate-ping" style={{animationDelay: '0.2s'}}></div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your gifts are being prepared with care.
          </p>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-lg p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order Number</span>
              <Badge variant="outline" className="font-mono">
                {orderId}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="font-semibold text-primary">{total.toFixed(2)} SAR</span>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estimated Delivery</span>
              </div>
              <p className="text-primary font-medium">{estimatedDelivery}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Order is being prepared
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                You'll receive updates via SMS and push notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3 border-t border-border">
        <Button onClick={onTrackOrder} className="w-full">
          <Package className="w-4 h-4 mr-2" />
          Track Your Order
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onContinueShopping} className="flex-1">
            Continue Shopping
          </Button>
          <Button variant="outline" onClick={onViewAllOrders} className="flex-1">
            View All Orders
          </Button>
        </div>

        <Button variant="ghost" onClick={handleShare} className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Share Order
        </Button>
      </div>

      {/* Bottom notification hint */}
      <div className="px-6 pb-6">
        <div className="text-center text-xs text-muted-foreground">
          We've sent a confirmation to your phone and email
        </div>
      </div>
    </div>
  );
}