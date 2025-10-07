import { useState, useEffect } from 'react';
import { AIChat } from './components/ai-chat';
import { CartView } from './components/cart-view';
import { CheckoutFlow } from './components/checkout-flow';
import { OrderConfirmation } from './components/order-confirmation';
import { BottomNavigation } from './components/bottom-navigation';
import { AuthFlow } from './components/auth-flow';
import { Button } from './components/ui/button';
import { Search, Package, User } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { Toaster } from './components/ui/sonner';

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

interface User {
  name: string;
  email: string;
}

type AppScreen = 'gifts' | 'browse' | 'orders' | 'profile' | 'cart' | 'checkout' | 'order-confirmation' | 'auth';
type AuthMode = 'signin' | 'signup' | 'forgot';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('gifts');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  // Auto set dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleAddToCart = (product: any, customizations: Record<string, any>) => {
    // Check if cart has items from a different vendor
    const currentVendor = getCurrentCartVendor();
    if (currentVendor && currentVendor !== product.vendor) {
      toast.error(`Cannot mix vendors in cart`, {
        description: `Your cart has items from ${currentVendor}. Clear cart to add items from ${product.vendor}.`,
        duration: 4000,
      });
      return;
    }

    const newItem: CartItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      vendor: product.vendor,
      price: product.price,
      image: product.image,
      quantity: customizations.quantity || 1,
      customizations
    };

    setCartItems(prev => [...prev, newItem]);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateCartTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 200 ? 0 : 15;
    const serviceFee = 5;
    const tax = subtotal * 0.15;
    return subtotal + deliveryFee + serviceFee + tax;
  };

  const getCurrentCartVendor = () => {
    return cartItems.length > 0 ? cartItems[0].vendor : undefined;
  };

  const handleOrderPlaced = (orderId: string) => {
    setCurrentOrderId(orderId);
    setCartItems([]); // Clear cart
    setCurrentScreen('order-confirmation');
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setCurrentScreen('gifts');
  };

  const requireAuth = (callback: () => void) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    callback();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'gifts':
        return (
          <AIChat
            cartCount={cartItems.length}
            cartVendor={getCurrentCartVendor()}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={() => setCurrentScreen('checkout')}
          />
        );

      case 'browse':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Browse Gifts</h2>
              <p className="text-muted-foreground">
                Traditional category browsing coming soon. For now, use our AI chat to discover gifts!
              </p>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your Orders</h2>
              {user ? (
                <p className="text-muted-foreground">
                  No orders yet. Start shopping to see your orders here!
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Sign in to view your orders
                  </p>
                  <Button onClick={() => setCurrentScreen('auth')}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              {user ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setUser(null)}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Profile</h2>
                  <p className="text-muted-foreground">
                    Sign in to manage your account
                  </p>
                  <Button onClick={() => setCurrentScreen('auth')}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'cart':
        return (
          <CartView
            items={cartItems}
            onClose={() => setCurrentScreen('gifts')}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onContinueShopping={() => setCurrentScreen('gifts')}
            onCheckout={() => setCurrentScreen('checkout')}
          />
        );

      case 'checkout':
        return (
          <CheckoutFlow
            items={cartItems}
            total={calculateCartTotal()}
            onBack={() => setCurrentScreen('cart')}
            onOrderPlaced={handleOrderPlaced}
          />
        );

      case 'order-confirmation':
        return (
          <OrderConfirmation
            orderId={currentOrderId}
            estimatedDelivery="Tomorrow, 2:00 PM - 4:00 PM"
            total={calculateCartTotal()}
            onContinueShopping={() => setCurrentScreen('gifts')}
            onTrackOrder={() => setCurrentScreen('orders')}
            onViewAllOrders={() => setCurrentScreen('orders')}
          />
        );

      case 'auth':
        return (
          <AuthFlow
            mode={authMode}
            onModeChange={setAuthMode}
            onClose={() => setCurrentScreen('gifts')}
            onSuccess={handleAuthSuccess}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground dark">
      {/* Main Content */}
      <div className={`flex-1 overflow-hidden ${
        !['cart', 'checkout', 'order-confirmation', 'auth'].includes(currentScreen) 
          ? 'pb-[72px]' 
          : ''
      }`}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation - Hide on certain screens */}
      {!['cart', 'checkout', 'order-confirmation', 'auth'].includes(currentScreen) && (
        <BottomNavigation
          activeTab={currentScreen as 'gifts' | 'browse' | 'orders' | 'profile'}
          onTabChange={setCurrentScreen}
          cartCount={cartItems.length}
        />
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}