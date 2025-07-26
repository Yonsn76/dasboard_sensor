import React, { useState, useEffect, useMemo } from 'react';
import { ApiRecord } from '../types';
import Card from '../components/Card';

const ITEMS_PER_PAGE = 15;

const RecordsPage: React.FC = () => {
    const [allRecords, setAllRecords] = useState<ApiRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        status: 'Todos',
        startDate: '',
        endDate: '',
        searchAction: '',
    });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch('https://arduino-api-nine.vercel.app/api/registros');
                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
                const data = await res.json();
                setAllRecords(Array.isArray(data) ? data : []);
                setError(null);
            } catch (e: any) {
                setError('No se pudieron cargar los registros. Inténtelo más tarde.');
                console.error("Error al cargar registros:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRecords = useMemo(() => {
        let records = [...allRecords];

        if (filters.status !== 'Todos') {
            records = records.filter(r => r.estado.toLowerCase() === filters.status.toLowerCase());
        }

        if (filters.startDate) {
            records = records.filter(r => new Date(r.fecha_hora) >= new Date(filters.startDate));
        }
        
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // Include whole day
            records = records.filter(r => new Date(r.fecha_hora) <= endDate);
        }

        if (filters.searchAction) {
            records = records.filter(r => r.accion.toLowerCase().includes(filters.searchAction.toLowerCase()));
        }

        return records.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
    }, [allRecords, filters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredRecords.slice(startIndex, endIndex);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentPage(1); // Reset to first page on filter change
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getStatusColor = (status: ApiRecord['estado']) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'alto') return 'text-red-500 bg-red-100';
        if (lowerStatus === 'normal') return 'text-yellow-500 bg-yellow-100';
        if (lowerStatus === 'bajo') return 'text-green-500 bg-green-100';
        return 'text-gray-500 bg-gray-100';
    };

    if (loading) return <div className="flex justify-center items-center h-full font-semibold text-lg">Cargando Registros...</div>;
    if (error) return <div className="flex justify-center items-center h-full text-red-600 font-semibold text-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="searchAction" className="block text-sm font-medium text-gray-700">Buscar por Acción</label>
                        <input type="text" name="searchAction" id="searchAction" value={filters.searchAction} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej: Ventilador ON" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option>Todos</option>
                            <option>Alto</option>
                            <option>Normal</option>
                            <option>Bajo</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">ID</th>
                                <th scope="col" className="px-4 py-3">Fecha y Hora</th>
                                <th scope="col" className="px-4 py-3">Acción</th>
                                <th scope="col" className="px-4 py-3 text-center">Temp (°C)</th>
                                <th scope="col" className="px-4 py-3 text-center">Hum (%)</th>
                                <th scope="col" className="px-4 py-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                             {paginatedData.length > 0 ? paginatedData.map((record) => (
                                <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-900">{record.id}</td>
                                    <td className="px-4 py-2">{new Date(record.fecha_hora).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                    <td className="px-4 py-2">{record.accion}</td>
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
                                    <td colSpan={6} className="text-center py-8">No se encontraron registros con los filtros aplicados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Anterior
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RecordsPage;