import React from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [],
  width = 100,
  height = 40,
  color = '#10b981',
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="flex items-center justify-center text-xs text-gray-500">Dados insuficientes</div>;
  }

  const values = data.filter(v => typeof v === 'number' && isFinite(v));
  if (values.length < 2) {
    return <div style={{ width, height }} className="flex items-center justify-center text-xs text-gray-500">Dados inválidos</div>;
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const getX = (index: number) => (index / (values.length - 1)) * width;
  const getY = (value: number) => height - ((value - min) / (range || 1)) * height;

  const path = values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`).join(' ');
  
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  const uniqueId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${uniqueId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default SparklineChart; 