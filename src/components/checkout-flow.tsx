import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { RiyalSymbol } from './riyal-symbol';

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

interface CheckoutFlowProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

interface DeliveryDetails {
  fullName: string;
  phone: string;
  street: string;
  building: string;
  district: string;
  city: string;
  additionalInstructions: string;
  deliveryDate: string;
  timeSlot: string;
  isGift: boolean;
  recipientName: string;
  giftMessage: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'cash';
  name: string;
  details?: string;
}

const timeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM', 
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
  '7:00 PM - 9:00 PM'
];

const districts = [
  'Al Hamra',
  'Al Rawdah',
  'Al Zahra',
  'Corniche',
  'Downtown',
  'King Abdullah Economic City',
  'North Jeddah',
  'South Jeddah'
];

export function CheckoutFlow({ items, total, onBack, onOrderPlaced }: CheckoutFlowProps) {
  const [step, setStep] = useState<'delivery' | 'payment' | 'review'>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    fullName: '',
    phone: '',
    street: '',
    building: '',
    district: '',
    city: 'Jeddah',
    additionalInstructions: '',
    deliveryDate: '',
    timeSlot: '',
    isGift: false,
    recipientName: '',
    giftMessage: ''
  });

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', type: 'card', name: 'Credit/Debit Card' },
    { id: 'apple_pay', type: 'apple_pay', name: 'Apple Pay' },
    { id: 'cash', type: 'cash', name: 'Cash on Delivery' }
  ];

  const isDeliveryValid = () => {
    return deliveryDetails.fullName && 
           deliveryDetails.phone && 
           deliveryDetails.street && 
           deliveryDetails.district && 
           deliveryDetails.deliveryDate && 
           deliveryDetails.timeSlot &&
           (!deliveryDetails.isGift || deliveryDetails.recipientName);
  };

  const isPaymentValid = () => {
    return selectedPayment !== null;
  };

  const isReviewValid = () => {
    return acceptTerms;
  };

  const handleNext = () => {
    if (step === 'delivery' && isDeliveryValid()) {
      setStep('payment');
    } else if (step === 'payment' && isPaymentValid()) {
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isReviewValid()) return;
    
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      const orderId = 'LUG-' + new Date().getFullYear() + '-' + Math.random().toString().substr(2, 6);
      onOrderPlaced(orderId);
    }, 2000);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
          <h1 className="text-lg font-semibold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {(['delivery', 'payment', 'review'] as const).map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-primary text-primary-foreground' :
                  index < (['delivery', 'payment', 'review'] as const).indexOf(step) ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < (['delivery', 'payment', 'review'] as const).indexOf(step) ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-4">
          {/* Delivery Details Step */}
          {step === 'delivery' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={deliveryDetails.fullName}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, fullName: e.target.value }))}
                />
                
                <Input
                  placeholder="Phone Number *"
                  value={deliveryDetails.phone}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phone: e.target.value }))}
                />
                
                <Input
                  placeholder="Street Address *"
                  value={deliveryDetails.street}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, street: e.target.value }))}
                />
                
                <Input
                  placeholder="Building/Apartment"
                  value={deliveryDetails.building}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, building: e.target.value }))}
                />
                
                <Select
                  value={deliveryDetails.district}
                  onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, district: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select District *" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  value="Jeddah"
                  disabled
                  className="bg-muted"
                />
                
                <Textarea
                  placeholder="Additional Instructions (Optional)"
                  value={deliveryDetails.additionalInstructions}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-medium">Delivery Schedule</h3>
                </div>
                
                <Input
                  type="date"
                  min={getTomorrowDate()}
                  value={deliveryDetails.deliveryDate}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryDate: e.target.value }))}
                />
                
                <Select
                  value={deliveryDetails.timeSlot}
                  onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, timeSlot: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Time Slot *" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isGift"
                    checked={deliveryDetails.isGift}
                    onCheckedChange={(checked) => 
                      setDeliveryDetails(prev => ({ ...prev, isGift: checked as boolean }))
                    }
                  />
                  <label htmlFor="isGift" className="text-sm font-medium">
                    This is a gift
                  </label>
                </div>

                {deliveryDetails.isGift && (
                  <div className="space-y-3 pl-6">
                    <Input
                      placeholder="Recipient Name *"
                      value={deliveryDetails.recipientName}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, recipientName: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Gift Message (Optional)"
                      value={deliveryDetails.giftMessage}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, giftMessage: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleNext} 
                disabled={!isDeliveryValid()}
                className="w-full"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPayment?.id === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPayment(method)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.name}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPayment?.id === method.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedPayment?.id === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('delivery')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!isPaymentValid()}
                  className="flex-1"
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Review & Confirm Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Review Your Order</h2>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-medium">Items ({items.length})</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.vendor}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiyalSymbol size="sm" />
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Delivery Summary */}
              <div className="space-y-2">
                <h3 className="font-medium">Delivery Details</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {deliveryDetails.fullName}</p>
                  <p><strong>Phone:</strong> {deliveryDetails.phone}</p>
                  <p><strong>Address:</strong> {deliveryDetails.street}, {deliveryDetails.building && deliveryDetails.building + ', '}{deliveryDetails.district}, {deliveryDetails.city}</p>
                  <p><strong>Date & Time:</strong> {deliveryDetails.deliveryDate} at {deliveryDetails.timeSlot}</p>
                  {deliveryDetails.isGift && (
                    <>
                      <p><strong>Recipient:</strong> {deliveryDetails.recipientName}</p>
                      {deliveryDetails.giftMessage && (
                        <p><strong>Gift Message:</strong> {deliveryDetails.giftMessage}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-2">
                <h3 className="font-medium">Payment Method</h3>
                <p className="text-sm">{selectedPayment?.name}</p>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <div className="flex items-center gap-2 text-primary">
                  <RiyalSymbol size="md" />
                  <span>{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={!isReviewValid() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : (
                    <div className="flex items-center gap-2">
                      Place Order - <RiyalSymbol size="sm" /> {total.toFixed(2)}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}