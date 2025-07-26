import React from 'react';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  title: string;
  subtitle: string;
  value: number;
  unit?: string;
  max: number;
  color: string;
  formatAsFloat?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ title, subtitle, value, unit, max, color, formatAsFloat = false }) => {
  const data = [
    { name: 'value', value: value },
    { name: 'background', value: max > value ? max - value : 0 },
  ];

  const displayValue = formatAsFloat ? value.toFixed(1) : value;

  return (
    <Card className="flex flex-col items-center justify-between text-center h-full">
      <div className='flex-shrink-0'>
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="relative w-32 h-20 mt-2 flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="95%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              dataKey="value"
              paddingAngle={0}
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-0 right-0">
           <span className="text-xl font-bold text-gray-800">{displayValue}</span>
           {unit && <span className="text-sm text-gray-600 ml-1">{unit}</span>}
        </div>
      </div>
       <div className="w-full flex justify-between text-xs text-gray-400 -mt-2 px-2 flex-shrink-0">
        <span>0</span>
        <span>{max}</span>
      </div>
    </Card>
  );
};

export default GaugeChart;