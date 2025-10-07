import SaudiRiyalSymbol21 from '../imports/SaudiRiyalSymbol21';

interface RiyalSymbolProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function RiyalSymbol({ className = '', size = 'md' }: RiyalSymbolProps) {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className}`}
      style={{ 
        '--fill-0': 'var(--primary)',
        color: 'var(--primary)'
      } as React.CSSProperties}
    >
      <SaudiRiyalSymbol21 />
    </div>
  );
}