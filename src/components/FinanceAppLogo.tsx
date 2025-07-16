import React from 'react';

interface FinanceAppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'horizontal' | 'vertical';
}

const FinanceAppLogo: React.FC<FinanceAppLogoProps> = ({ 
  size = 64, 
  className = '', 
  showText = false,
  textClassName = '',
  variant = 'horizontal'
}) => {
  const isVertical = variant === 'vertical';
  
  return (
    <div className={`${isVertical ? 'flex flex-col items-center' : 'flex items-center'} gap-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
        style={{ width: size, height: size }}
      >
        <svg 
          width={size * 0.5} 
          height={size * 0.5} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M3 17L9 11L15 15L21 11" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
          <path 
            d="M21 11L21 15" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div className={`text-center ${textClassName}`}>
          <h1 className="text-3xl font-bold text-white mb-2">FinanceApp</h1>
          <p className="text-gray-400">Crie sua conta e comece a controlar seus gastos</p>
        </div>
      )}
    </div>
  );
};

export default FinanceAppLogo; 