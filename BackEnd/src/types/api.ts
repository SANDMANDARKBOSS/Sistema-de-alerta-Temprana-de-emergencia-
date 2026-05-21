export type EstadoPolizaTexto = 'Póliza Válida' | 'En Validación' | 'Póliza Inválida';
export type EstadoNotificacion = 'Notificado' | 'Pendiente';

export interface IngresoApiItem {
  id: string;
  paciente: {
    nombre: string;
    id: string;
    avatar?: string;
  };
  motivo: string;
  poliza: EstadoPolizaTexto;
  estado: EstadoNotificacion;
  horaIngreso: string;
}

export interface AlertasResponse {
  ingresos: IngresoApiItem[];
}
