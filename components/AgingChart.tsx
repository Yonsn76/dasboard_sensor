import React from 'react';
import Card from './Card';
import { StateDistributionData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StateDistributionChartProps {
    data: StateDistributionData[];
}

const formatYAxis = (tick: number) => {
  return tick.toFixed(0);
};

const StateDistributionChart: React.FC<StateDistributionChartProps> = ({ data }) => {
  return (
    <Card className="h-full">
      <h3 className="text-md font-semibold text-gray-700 mb-4">Distribución por Estado</h3>
      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              formatter={(value: number, name: string) => [`${value.toFixed(2)} ${name.includes('Temp') ? '°C' : '%'}`, name]}
              cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
            />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: '20px' }} />
            <Bar dataKey="Temp. Promedio" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="Hum. Promedio" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StateDistributionChart;