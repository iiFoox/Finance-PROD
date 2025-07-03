import React from 'react';

interface CryptoChartProps {
  data: number[];
  isPositive: boolean;
  height?: number;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, isPositive, height = 40 }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`w-24 h-${height} bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center`}>
        <span className="text-xs text-gray-500">No data</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Normalizar dados para 0-100
  const normalizedData = data.map(point => range === 0 ? 50 : ((point - min) / range) * 100);

  // Criar pontos SVG
  const points = normalizedData.map((point, index) => {
    const x = (index / (normalizedData.length - 1)) * 100;
    const y = 100 - point; // Inverter Y para SVG
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-24 h-10 relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="absolute inset-0"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2"
          className="opacity-80"
        />
        
        {/* Área sob a curva */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={isPositive ? '#10b981' : '#ef4444'}
          className="opacity-20"
        />
      </svg>
    </div>
  );
};

export default CryptoChart; 