import React from 'react';
import { ReadingsHistoryData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ReadingsHistoryChartProps {
    data: ReadingsHistoryData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
        <p className="font-bold">{label}</p>
        {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
                {`${pld.name}: ${pld.value.toFixed(2)}${pld.name === 'Temperatura' ? '°C' : '%'}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReadingsHistoryChart: React.FC<ReadingsHistoryChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#ef4444" tickFormatter={(t) => `${t.toFixed(0)}°C`} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tickFormatter={(h) => `${h.toFixed(0)}%`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" name="Temperatura" dataKey="Temperatura" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Humedad" dataKey="Humedad" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ReadingsHistoryChart;