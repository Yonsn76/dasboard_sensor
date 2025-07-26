export interface ApiRecord {
  id: number;
  fecha_hora: string;
  temperatura: number;
  humedad: number;
  estado: 'Alto' | 'Normal' | 'Bajo';
  accion: string;
}

export interface StateDistributionData {
  name: string;
  'Temp. Promedio': number;
  'Hum. Promedio': number;
}

export interface ReadingsHistoryData {
  name: string;
  'Temperatura': number;
  'Humedad': number;
}
