import React from 'react';

interface PixelCategoryIconsProps {
  category: string;
  size?: number;
  className?: string;
}

const PixelCategoryIcons: React.FC<PixelCategoryIconsProps> = ({ 
  category, 
  size = 24, 
  className = "" 
}) => {
  const getIcon = (category: string) => {
    const iconStyle = {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      fontSize: `${size * 0.55}px`,
      fontWeight: '600',
      color: 'white',
      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
    };

    const categoryMap: { [key: string]: { icon: string; bgColor: string; gradient: string } } = {
      // Receitas
      'Salário': { 
        icon: '💵', 
        bgColor: '#10B981', 
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)' 
      },
      'Freelance': { 
        icon: '💻', 
        bgColor: '#3B82F6', 
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)' 
      },
      'Investimentos': { 
        icon: '📈', 
        bgColor: '#8B5CF6', 
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)' 
      },
      'Vendas': { 
        icon: '🛍️', 
        bgColor: '#F59E0B', 
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)' 
      },
      'Presentes': { 
        icon: '🎁', 
        bgColor: '#EC4899', 
        gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)' 
      },
      'Outros': { 
        icon: '✨', 
        bgColor: '#6B7280', 
        gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)' 
      },

      // Despesas
      'Alimentação': { 
        icon: '🍕', 
        bgColor: '#EF4444', 
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)' 
      },
      'Transporte': { 
        icon: '🚙', 
        bgColor: '#06B6D4', 
        gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)' 
      },
      'Moradia': { 
        icon: '🏡', 
        bgColor: '#84CC16', 
        gradient: 'linear-gradient(135deg, #84CC16 0%, #65A30D 50%, #4D7C0F 100%)' 
      },
      'Saúde': { 
        icon: '💊', 
        bgColor: '#F97316', 
        gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)' 
      },
      'Educação': { 
        icon: '🎓', 
        bgColor: '#6366F1', 
        gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)' 
      },
      'Lazer': { 
        icon: '🎬', 
        bgColor: '#A855F7', 
        gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 50%, #7C3AED 100%)' 
      },
      'Vestuário': { 
        icon: '👗', 
        bgColor: '#14B8A6', 
        gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)' 
      },
      'Serviços': { 
        icon: '🔧', 
        bgColor: '#64748B', 
        gradient: 'linear-gradient(135deg, #64748B 0%, #475569 50%, #334155 100%)' 
      },

      // Investimentos
      'Ações': { 
        icon: '📊', 
        bgColor: '#059669', 
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)' 
      },
      'Fundos Imobiliários': { 
        icon: '🏢', 
        bgColor: '#7C3AED', 
        gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)' 
      },
      'Tesouro Direto': { 
        icon: '🏛️', 
        bgColor: '#DC2626', 
        gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)' 
      },
      'CDB': { 
        icon: '🏦', 
        bgColor: '#2563EB', 
        gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)' 
      },
      'Criptomoedas': { 
        icon: '₿', 
        bgColor: '#F59E0B', 
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)' 
      },
      'Previdência': { 
        icon: '👴', 
        bgColor: '#8B5CF6', 
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)' 
      },
      'Ouro': { 
        icon: '🥇', 
        bgColor: '#F59E0B', 
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)' 
      },
      'Fundos de Investimento': { 
        icon: '📈', 
        bgColor: '#10B981', 
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)' 
      },

      // Categorias gerais
      'Receita': { 
        icon: '💰', 
        bgColor: '#10B981', 
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)' 
      },
      'Despesa': { 
        icon: '💸', 
        bgColor: '#EF4444', 
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)' 
      },
      'Investimento': { 
        icon: '📈', 
        bgColor: '#8B5CF6', 
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)' 
      },
    };

    const iconData = categoryMap[category] || categoryMap['Outros'];

    return (
      <div
        style={{
          ...iconStyle,
          background: iconData.gradient,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 4s ease-in-out infinite',
        }}
        className={`category-icon ${className}`}
        title={category}
      >
        <span style={{ 
          fontSize: category === 'Criptomoedas' ? `${size * 0.45}px` : `${size * 0.55}px`,
          fontWeight: category === 'Criptomoedas' ? 'bold' : '600',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
        }}>
          {iconData.icon}
        </span>
      </div>
    );
  };

  return getIcon(category);
};

export default PixelCategoryIcons; 