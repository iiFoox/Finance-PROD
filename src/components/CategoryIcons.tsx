import React from 'react';
import { 
  Utensils, 
  Car, 
  Home, 
  Gamepad2, 
  Heart, 
  GraduationCap, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  MoreHorizontal,
  CreditCard,
  PiggyBank,
  ShoppingCart,
  Bus,
  Train,
  Bike,
  Wifi,
  Zap,
  Droplets,
  Building2,
  Film,
  Music,
  Plane,
  Hotel,
  Stethoscope,
  Pill,
  BookOpen,
  School,
  Calculator,
  Gift
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  type?: 'income' | 'expense' | 'investment';
  size?: number;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  type = 'expense', 
  size = 20, 
  className = '' 
}) => {
  const getIcon = () => {
    const categoryLower = category.toLowerCase();
    
    // Despesas
    if (type === 'expense') {
      switch (categoryLower) {
        case 'alimentação':
          return <Utensils size={size} />;
        case 'transporte':
          return <Car size={size} />;
        case 'moradia':
          return <Home size={size} />;
        case 'lazer':
          return <Gamepad2 size={size} />;
        case 'saúde':
          return <Heart size={size} />;
        case 'educação':
          return <GraduationCap size={size} />;
        case 'outros':
          return <MoreHorizontal size={size} />;
        default:
          return <Calculator size={size} />;
      }
    }
    
    // Receitas
    if (type === 'income') {
      switch (categoryLower) {
        case 'salário':
          return <DollarSign size={size} />;
        case 'freelance':
          return <Briefcase size={size} />;
        case 'rendimentos':
          return <TrendingUp size={size} />;
        case 'investimentos':
          return <PiggyBank size={size} />;
        case 'outros':
          return <Gift size={size} />;
        default:
          return <DollarSign size={size} />;
      }
    }
    
    // Investimentos
    if (type === 'investment') {
      switch (categoryLower) {
        case 'criptoativos':
          return <TrendingUp size={size} />;
        case 'renda fixa':
          return <PiggyBank size={size} />;
        case 'fundo de investimento':
          return <Building2 size={size} />;
        case 'ações':
          return <TrendingUp size={size} />;
        case 'tesouro direto':
          return <DollarSign size={size} />;
        case 'fundos de índice (etfs)':
          return <TrendingUp size={size} />;
        case 'fundos imobiliários':
          return <Home size={size} />;
        case 'bens':
          return <Gift size={size} />;
        case 'outros':
          return <MoreHorizontal size={size} />;
        default:
          return <TrendingUp size={size} />;
      }
    }
    
    return <Calculator size={size} />;
  };

  const getColor = () => {
    const categoryLower = category.toLowerCase();
    
    // Despesas
    if (type === 'expense') {
      switch (categoryLower) {
        case 'alimentação':
          return 'text-orange-500';
        case 'transporte':
          return 'text-blue-500';
        case 'moradia':
          return 'text-purple-500';
        case 'lazer':
          return 'text-pink-500';
        case 'saúde':
          return 'text-red-500';
        case 'educação':
          return 'text-indigo-500';
        case 'outros':
          return 'text-gray-500';
        default:
          return 'text-gray-500';
      }
    }
    
    // Receitas
    if (type === 'income') {
      switch (categoryLower) {
        case 'salário':
          return 'text-green-500';
        case 'freelance':
          return 'text-blue-500';
        case 'rendimentos':
          return 'text-emerald-500';
        case 'investimentos':
          return 'text-yellow-500';
        case 'outros':
          return 'text-green-500';
        default:
          return 'text-green-500';
      }
    }
    
    // Investimentos
    if (type === 'investment') {
      switch (categoryLower) {
        case 'criptoativos':
          return 'text-blue-500';
        case 'renda fixa':
          return 'text-green-500';
        case 'fundo de investimento':
          return 'text-purple-500';
        case 'ações':
          return 'text-yellow-500';
        case 'tesouro direto':
          return 'text-red-500';
        case 'fundos de índice (etfs)':
          return 'text-pink-500';
        case 'fundos imobiliários':
          return 'text-indigo-500';
        case 'bens':
          return 'text-orange-500';
        case 'outros':
          return 'text-gray-500';
        default:
          return 'text-blue-500';
      }
    }
    
    return 'text-gray-500';
  };

  return (
    <div className={`${getColor()} ${className}`}>
      {getIcon()}
    </div>
  );
};

export default CategoryIcon; 