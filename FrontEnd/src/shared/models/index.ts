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

export interface IngresoCompleto extends Ingreso {
  polizaNumero: string;     // "POL-12345678"
  polizaPlan: string;       // "Salud Integral"
  fecha: string;            // "24/05/2024"
  estadoSubtexto: string;   // "Notificado" | "Pendiente" | "No cubierta"
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

export interface ResumenMetricas {
  ingresosHoy: number;
  ingresosChangePercent: string;       // "+12%"
  polizasValidadas: number;
  polizasValidadasPercent: string;     // "83%"
  enValidacion: number;
  enValidacionPercent: string;         // "12%"
  invalidas: number;
  invalidasPercent: string;            // "5%"
  sparklineIngresos: number[];
  sparklineValidadas: number[];
  sparklineValidacion: number[];
  sparklineInvalidas: number[];
}
