import { Card, CardContent } from './ui/card';
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

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onSelect, className = '' }: ProductCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${className}`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-3">
        <div className="aspect-square rounded-lg overflow-hidden mb-3">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium line-clamp-2">{product.name}</h4>
            <p className="text-muted-foreground font-medium">{product.vendor}</p>
          </div>
          
          <div className="font-medium text-primary flex items-center gap-2">
            <RiyalSymbol size="sm" />
            {product.price}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}