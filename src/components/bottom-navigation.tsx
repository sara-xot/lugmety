import { Home, BookmarkCheck, User, MoreHorizontal } from 'lucide-react';
import { Badge } from './ui/badge';
import svgPaths from '../imports/svg-yguox8xqm2';
import imgStylizedLogoDesign1 from "figma:asset/9996aef17cc356a14e1aaf99fe076aab14044ed2.png";

interface BottomNavigationProps {
  activeTab: 'gifts' | 'browse' | 'orders' | 'profile';
  onTabChange: (tab: 'gifts' | 'browse' | 'orders' | 'profile') => void;
  cartCount?: number;
}

function UiIconHomeLight() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d={svgPaths.p15b07780} fill="white" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

function UiIconBookmarkLight() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d={svgPaths.p2cf2000} fill="white" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p21915d00} fill="white" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

function UiIconPersonLight() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d={svgPaths.p8616800} fill="white" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.pf02dc00} fill="white" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

function MoreHorizIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path d={svgPaths.p5910600} fill="#BABABB" />
        </g>
      </svg>
    </div>
  );
}

export function BottomNavigation({ activeTab, onTabChange, cartCount = 0 }: BottomNavigationProps) {
  const tabs = [
    { id: 'browse' as const, label: 'Home', icon: UiIconHomeLight, active: false },
    { id: 'orders' as const, label: 'Order', icon: UiIconBookmarkLight, active: false },
    { id: 'gifts' as const, label: '', icon: null, active: true }, // Center logo
    { id: 'profile' as const, label: 'Profile', icon: UiIconPersonLight, active: false },
    { id: 'browse' as const, label: 'More', icon: MoreHorizIcon, active: false }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black h-[72px]">
      <div className="absolute content-stretch flex gap-[40px] items-center justify-center top-[11px] w-full">
        {/* Home */}
        <button
          onClick={() => onTabChange('browse')}
          className={`flex flex-col gap-1 items-center ${
            activeTab === 'browse' ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <UiIconHomeLight />
          <div className="font-medium text-[10px] text-white opacity-90">
            Home
          </div>
        </button>

        {/* Orders */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex flex-col gap-1 items-center w-[30px] ${
            activeTab === 'orders' ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <UiIconBookmarkLight />
          <div className="font-medium text-[10px] text-white opacity-90">
            Order
          </div>
        </button>

        {/* Center Logo - AI Gifts */}
        <button
          onClick={() => onTabChange('gifts')}
          className="bg-[#252525] relative rounded-[40px] shrink-0 size-[60px]"
        >
          <div className="absolute left-[5.5px] size-[50px] top-[5px]">
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" 
              src={imgStylizedLogoDesign1} 
            />
          </div>

        </button>

        {/* Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col gap-1 items-center w-[30px] ${
            activeTab === 'profile' ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <UiIconPersonLight />
          <div className="font-medium text-[10px] text-white opacity-90">
            Profile
          </div>
        </button>

        {/* More */}
        <button
          className="flex flex-col gap-1 items-center opacity-70"
        >
          <MoreHorizIcon />
          <div className="font-medium text-[10px] text-[#bababb]">
            More
          </div>
        </button>
      </div>
    </div>
  );
}