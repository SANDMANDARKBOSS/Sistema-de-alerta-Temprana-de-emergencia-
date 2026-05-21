// src/shared/models/index.ts

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

export interface Notificacion {
  tipo: 'validada' | 'en-proceso' | 'invalida' | 'enviada';
  descripcion: string;
  paciente: string;
  hora: string;
}

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

export type EstadoAlerta = 'en-validacion' | 'invalida' | 'notificada';

export interface AlertaActiva {
  id: string;
  paciente: {
    nombre: string;
    id: string;
    avatar?: string;
  };
  motivoIngreso: string;
  polizaNumero: string;       // "POL-87654321"
  polizaPlan: string;         // "Vida Salud"
  estado: EstadoAlerta;
  estadoSubtexto: string;     // "Pendiente de revisión" | "No cubierta" | "En proceso"
  horaIngreso: Date;          // Para calcular el cronómetro
  horaIngresoTexto: string;   // "09:23 AM" (para mostrar)
  tiempoTranscurrido?: string; // "00:18:45" — calculado dinámicamente
}

export interface ResumenAlertas {
  total: number;
  enValidacion: number;
  invalidas: number;
  notificadas: number;
}

// --- NUEVOS MODELOS PÓLIZAS ---

export type EstadoPoliza = 'valida' | 'en-validacion' | 'invalida';

export interface PolizaCompleta {
  id: string;
  paciente: {
    nombre: string;
    id: string;
    avatar?: string;
  };
  numeroPoliza: string;        // "POL-12345678"
  aseguradora: string;         // "Salud Integral"
  estado: EstadoPoliza;
  estadoSubtexto: string;      // "Cobertura activa" | "Revisión en curso" | "No tiene cobertura"
  fechaHora: string;           // "24/05/2024"
  horaIngreso: string;         // "09:35 AM"
  validaHasta: string | null;  // "24/05/2025" o null
}

export interface ResumenPolizasDashboard {
  validasHoy: number;
  validasChangePercent: string;     // "+18%"
  enValidacion: number;
  invalidas: number;
  tasaValidacion: number;           // 95 (porcentaje)
  sparklineValidadas: number[];
  sparklineEnValidacion: number[];
  sparklineInvalidas: number[];
  sparklineTasa: number[];
}

// --- NUEVOS MODELOS HISTORIAL ---

export type EstadoCaso = 'cerrado' | 'en-proceso' | 'escalado';

export interface CasoHistorial {
  id: string;                    // "CAS-2024-1287"
  pacienteId: string;            // "78945612"
  paciente: {
    nombre: string;
    id: string;
    avatar?: string;
  };
  fechaIngreso: string;          // "24/05/2024"
  horaIngreso: string;           // "09:35 AM"
  motivoIngreso: string;
  estado: EstadoCaso;
  estadoSubtexto: string;        // "Póliza válida" | "Revisión en curso" | "Sin cobertura"
  gestorAsignado: {
    nombre: string;
    avatar?: string;
  };
  tiempoGestion: string;         // "00:04:32" (estático, histórico)
}

export interface ResumenHistorial {
  totalCasos: number;
  casosCerrados: number;
  cerradosPorcentaje: number;    // 70
  casosEnProceso: number;
  enProcesoPorcentaje: number;   // 23
  casosEscalados: number;
  escaladosPorcentaje: number;   // 8
  tiempoPromedioGestion: string; // "6.2 min"
  tiempoChangePercent: string;   // "-12%"
  sparklineTotalCasos: number[];
  sparklineCerrados: number[];
  sparklineEnProceso: number[];
  sparklineEscalados: number[];
  sparklineTiempo: number[];
}
