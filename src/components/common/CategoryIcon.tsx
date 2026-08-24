import React from 'react';
import {
  Gamepad2,
  ShieldAlert,
  Coins,
  Sparkles,
  CreditCard,
  Laptop,
  Cpu,
  Tv,
  Radio,
  Projector,
  Share2,
  TrendingUp,
  Server,
  Boxes,
  Wrench,
  Layers,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'Projector': return <Projector className={className} />;
    case 'Share2': return <Share2 className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Server': return <Server className={className} />;
    case 'Boxes': return <Boxes className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Layers': return <Layers className={className} />;
    default: return <HelpCircle className={className} />;
  }
};
