// src/shared/models/ingreso.model.ts
export interface Ingreso {
  id: string;
  paciente: {
    nombre: string;
    id: string;
    avatar?: string;
  };
  motivo: string;
  poliza: 'Póliza Válida' | 'En Validación' | 'Póliza Inválida';
  estado: 'Notificado' | 'Pendiente';
  horaIngreso: string; // "09:35 AM"
}

// src/shared/models/notificacion.model.ts
export interface Notificacion {
  tipo: 'validada' | 'en-proceso' | 'invalida' | 'enviada';
  descripcion: string;
  paciente: string;
  hora: string;
}

// src/shared/models/resumen.model.ts
export interface ResumenIngresos {
  total: number;
  cambioVsAyer: string; // "+12%"
  ingresos: Ingreso[];
}

export interface ResumenPolizas {
  validadas: number;
  enValidacion: number;
  invalidas: number;
  totalHoy: number;
  porcentajeValidadas: number;
}
