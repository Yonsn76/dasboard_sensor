
import React, { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import GaugeChart from '../components/GaugeChart';
import StateDistributionChart from '../components/AgingChart';
import Card from '../components/Card';
import ReadingsHistoryChart from '../components/WorkingCapitalChart';
import RecordsTable from '../components/ProfitLossChart';
import { ApiRecord } from '../types';

const getStatusKpiColor = (status: ApiRecord['estado']): 'primary-red' | 'primary-yellow' | 'primary-green' => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'alto') return 'primary-red';
    if (lowerStatus === 'normal') return 'primary-yellow';
    if (lowerStatus === 'bajo') return 'primary-green';
    return 'primary-yellow';
};

const DashboardPage: React.FC = () => {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyOffset, setHistoryOffset] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://arduino-api-nine.vercel.app/api/registros');
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: any) {
        setError('No se pudieron cargar los datos del sensor. Inténtelo más tarde.');
        console.error("Error al cargar registros:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
     const interval = setInterval(fetchData, 30000); // Actualiza cada 30 segundos
     return () => clearInterval(interval);
  }, []);

  const processedData = useMemo(() => {
    if (!records || records.length === 0) return null;

    const sortedRecords = [...records].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
    const latestRecord = sortedRecords[sortedRecords.length - 1];
    
    const avgTemp = records.reduce((acc, r) => acc + r.temperatura, 0) / records.length;
    const avgHum = records.reduce((acc, r) => acc + r.humedad, 0) / records.length;

    const stateCounts = records.reduce((acc, r) => {
        const stateKey = r.estado || 'Indefinido';
        acc[stateKey] = (acc[stateKey] || 0) + 1;
        return acc;
    }, {} as Record<ApiRecord['estado'] | 'Indefinido', number>);

    const states: ApiRecord['estado'][] = ['Bajo', 'Normal', 'Alto'];
    const stateDistributionData = states.map(state => {
        const stateRecords = records.filter(r => r.estado === state);
        if (stateRecords.length === 0) return { name: state, 'Temp. Promedio': 0, 'Hum. Promedio': 0 };
        return {
            name: state,
            'Temp. Promedio': stateRecords.reduce((acc, r) => acc + r.temperatura, 0) / stateRecords.length,
            'Hum. Promedio': stateRecords.reduce((acc, r) => acc + r.humedad, 0) / stateRecords.length,
        };
    });
    
    const lastRecordTime = latestRecord ? new Date(latestRecord.fecha_hora).getTime() : Date.now();
    const startTime = lastRecordTime - (historyOffset + 1) * 12 * 60 * 60 * 1000;
    const endTime = lastRecordTime - historyOffset * 12 * 60 * 60 * 1000;

    const historyData = sortedRecords.filter(r => {
        const recordTime = new Date(r.fecha_hora).getTime();
        return recordTime >= startTime && recordTime < endTime;
    }).map(r => ({
        name: new Date(r.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        'Temperatura': r.temperatura,
        'Humedad': r.humedad,
    }));
    
    const hasOlderRecords = sortedRecords.some(r => new Date(r.fecha_hora).getTime() < startTime);

    return {
        stateCounts, latestRecord,
        avgTemp, avgHum,
        stateDistributionData, historyData,
        latestRecordsForTable: [...records].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()).slice(0, 50),
        hasOlderRecords
    };
  }, [records, historyOffset]);

  if (loading) return <div className="flex justify-center items-center h-full font-semibold text-lg">Cargando Datos del Sensor...</div>;
  if (error) return <div className="flex justify-center items-center h-full text-red-600 font-semibold text-lg">{error}</div>;
  if (!processedData) return <div className="flex justify-center items-center h-full font-semibold text-lg">No hay datos disponibles para mostrar.</div>;
  
  const { latestRecord, stateCounts, avgTemp, avgHum, stateDistributionData, historyData, latestRecordsForTable, hasOlderRecords } = processedData;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        <KpiCard title="Temperatura Actual" value={`${latestRecord.temperatura.toFixed(1)}°C`} color="primary-red" />
        <KpiCard title="Humedad Actual" value={`${latestRecord.humedad.toFixed(1)}%`} color="primary-blue" />
        <KpiCard title="Fecha y Hora" value={new Date(latestRecord.fecha_hora).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}>
           <p className="text-gray-600 font-semibold text-lg">{new Date(latestRecord.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        </KpiCard>
        <KpiCard title="Última Acción" value={latestRecord.accion} />
        <KpiCard title="Estado Actual" value={latestRecord.estado} color={getStatusKpiColor(latestRecord.estado)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <GaugeChart title="Promedio Temp." subtitle="General" value={avgTemp} unit="°C" max={40} color="#ef4444" formatAsFloat />
          <GaugeChart title="Promedio Hum." subtitle="General" value={avgHum} unit="%" max={100} color="#3b82f6" formatAsFloat />
          <GaugeChart title="Registros 'Bajo'" subtitle="Eventos" value={stateCounts['Bajo'] || 0} max={records.length} color="#22c55e" />
          <GaugeChart title="Registros 'Normal'" subtitle="Eventos" value={stateCounts['Normal'] || 0} max={records.length} color="#f59e0b" />
          <GaugeChart title="Registros 'Alto'" subtitle="Eventos" value={stateCounts['Alto'] || 0} max={records.length} color="#f97316" />
        </div>
        <div className="lg:col-span-1">
          <StateDistributionChart data={stateDistributionData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-700">Historial de Lecturas</h3>
                    <div className="space-x-2">
                        <button
                            onClick={() => setHistoryOffset(prev => prev + 1)}
                            disabled={!hasOlderRecords}
                            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr; 12h Anteriores
                        </button>
                        <button
                            onClick={() => setHistoryOffset(0)}
                            disabled={historyOffset === 0}
                            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Últimas 12h
                        </button>
                    </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                    <ReadingsHistoryChart data={historyData} />
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <RecordsTable records={latestRecordsForTable} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
