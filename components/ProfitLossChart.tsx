import React from 'react';
import Card from './Card';
import { ApiRecord } from '../types';

interface RecordsTableProps {
  records: ApiRecord[];
}

const RecordsTable: React.FC<RecordsTableProps> = ({ records }) => {
  const getStatusColor = (status: ApiRecord['estado']) => {
    switch (status) {
      case 'Alto': return 'text-red-500 bg-red-100';
      case 'Normal': return 'text-yellow-500 bg-yellow-100';
      case 'Bajo': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-md font-semibold text-gray-700 mb-4">Últimos Registros</h3>
      <div className="flex-grow overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">ID</th>
                <th scope="col" className="px-4 py-3">Fecha y Hora</th>
                <th scope="col" className="px-4 py-3 text-center">Temp (°C)</th>
                <th scope="col" className="px-4 py-3 text-center">Hum (%)</th>
                <th scope="col" className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map((record) => (
                <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{record.id}</td>
                  <td className="px-4 py-2">{new Date(record.fecha_hora).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })}</td>
                  <td className="px-4 py-2 text-center">{record.temperatura.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">{record.humedad.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.estado)}`}>
                      {record.estado}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-8">No se encontraron registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default RecordsTable;