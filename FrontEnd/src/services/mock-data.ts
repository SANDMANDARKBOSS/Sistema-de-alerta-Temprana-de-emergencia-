import { 
  Ingreso, 
  Notificacion, 
  IngresoCompleto, 
  AlertaActiva, 
  ResumenAlertas,
  PolizaCompleta,
  CasoHistorial
} from '../shared/models';

export const MOCK_INGRESOS: Ingreso[] = [
  {
    id: '1',
    paciente: { nombre: 'Juan Pérez Gómez', id: '78945612' },
    motivo: 'Dolor abdominal',
    poliza: 'Póliza Válida',
    estado: 'Notificado',
    horaIngreso: '09:35 AM'
  },
  {
    id: '2',
    paciente: { nombre: 'María López Silva', id: '45678923' },
    motivo: 'Trauma leve',
    poliza: 'En Validación',
    estado: 'Pendiente',
    horaIngreso: '09:28 AM'
  },
  {
    id: '3',
    paciente: { nombre: 'Carlos Ramírez Torres', id: '32165498' },
    motivo: 'Fiebre alta',
    poliza: 'Póliza Válida',
    estado: 'Notificado',
    horaIngreso: '09:21 AM'
  },
  {
    id: '4',
    paciente: { nombre: 'Ana Lucía Fernández', id: '65498731' },
    motivo: 'Dolor en el pecho',
    poliza: 'Póliza Inválida',
    estado: 'Notificado',
    horaIngreso: '09:15 AM'
  }
];

export const MOCK_NOTIFICACIONES: Notificacion[] = [
  { tipo: 'validada', descripcion: 'Póliza validada correctamente', paciente: 'Juan Pérez Gómez', hora: '09:35 AM' },
  { tipo: 'en-proceso', descripcion: 'Validación en proceso', paciente: 'María López Silva', hora: '09:28 AM' },
  { tipo: 'invalida', descripcion: 'Póliza inválida', paciente: 'Ana Lucía Fernández', hora: '09:15 AM' },
  { tipo: 'enviada', descripcion: 'Notificación enviada', paciente: 'Carlos Ramírez Torres', hora: '09:21 AM' }
];

export const MOCK_INGRESOS_COMPLETOS: IngresoCompleto[] = [
  {
    id: '1',
    paciente: { nombre: 'Juan Pérez Gómez', id: '78945612' },
    motivo: 'Dolor abdominal',
    poliza: 'Póliza Válida',
    polizaNumero: 'POL-12345678',
    polizaPlan: 'Salud Integral',
    estado: 'Notificado',
    estadoSubtexto: 'Notificado',
    horaIngreso: '09:35 AM',
    fecha: '24/05/2024'
  },
  {
    id: '2',
    paciente: { nombre: 'María López Silva', id: '45678923' },
    motivo: 'Trauma leve',
    poliza: 'En Validación',
    polizaNumero: 'POL-87654321',
    polizaPlan: 'Vida Salud',
    estado: 'Pendiente',
    estadoSubtexto: 'Pendiente',
    horaIngreso: '09:28 AM',
    fecha: '24/05/2024'
  },
  {
    id: '3',
    paciente: { nombre: 'Carlos Ramírez Torres', id: '32165498' },
    motivo: 'Fiebre alta',
    poliza: 'Póliza Válida',
    polizaNumero: 'POL-11223344',
    polizaPlan: 'Salud Total',
    estado: 'Notificado',
    estadoSubtexto: 'Notificado',
    horaIngreso: '09:21 AM',
    fecha: '24/05/2024'
  },
  {
    id: '4',
    paciente: { nombre: 'Ana Lucía Fernández', id: '65498731' },
    motivo: 'Dolor en el pecho',
    poliza: 'Póliza Inválida',
    polizaNumero: 'POL-44332211',
    polizaPlan: 'Protección Familiar',
    estado: 'Notificado',
    estadoSubtexto: 'No cubierta',
    horaIngreso: '09:15 AM',
    fecha: '24/05/2024'
  },
  {
    id: '5',
    paciente: { nombre: 'Luis Fernando Castro', id: '98765432' },
    motivo: 'Crisis hipertensiva',
    poliza: 'Póliza Válida',
    polizaNumero: 'POL-99887766',
    polizaPlan: 'Salud Integral',
    estado: 'Notificado',
    estadoSubtexto: 'Notificado',
    horaIngreso: '09:10 AM',
    fecha: '24/05/2024'
  },
  {
    id: '6',
    paciente: { nombre: 'Sofía Martínez Rojas', id: '78912345' },
    motivo: 'Fractura de brazo',
    poliza: 'En Validación',
    polizaNumero: 'POL-55667788',
    polizaPlan: 'Vida Salud',
    estado: 'Pendiente',
    estadoSubtexto: 'Pendiente',
    horaIngreso: '09:05 AM',
    fecha: '24/05/2024'
  },
  {
    id: '7',
    paciente: { nombre: 'Diego Herrera Ruiz', id: '12378945' },
    motivo: 'Dificultad respiratoria',
    poliza: 'Póliza Válida',
    polizaNumero: 'POL-66778899',
    polizaPlan: 'Salud Total',
    estado: 'Notificado',
    estadoSubtexto: 'Notificado',
    horaIngreso: '09:02 AM',
    fecha: '24/05/2024'
  }
];

export const MOCK_RESUMEN_ALERTAS: ResumenAlertas = {
  total: 5,
  enValidacion: 2,
  invalidas: 1,
  notificadas: 2
};

export const MOCK_ALERTAS: AlertaActiva[] = [
  {
    id: 'a1',
    paciente: { nombre: 'María López Silva', id: '45678923' },
    motivoIngreso: 'Trauma leve',
    polizaNumero: 'POL-87654321',
    polizaPlan: 'Vida Salud',
    estado: 'en-validacion',
    estadoSubtexto: 'Pendiente de revisión',
    horaIngreso: new Date(Date.now() - 1105000), // ~18 mins ago
    horaIngresoTexto: '09:23 AM'
  },
  {
    id: 'a2',
    paciente: { nombre: 'Ana Lucía Fernández', id: '65498731' },
    motivoIngreso: 'Dolor en el pecho',
    polizaNumero: 'POL-44332211',
    polizaPlan: 'Protección Familiar',
    estado: 'invalida',
    estadoSubtexto: 'No cubierta',
    horaIngreso: new Date(Date.now() - 1512000), // ~25 mins ago
    horaIngresoTexto: '09:16 AM'
  },
  {
    id: 'a3',
    paciente: { nombre: 'Luis Fernando Castro', id: '98765432' },
    motivoIngreso: 'Crisis hipertensiva',
    polizaNumero: 'POL-99887766',
    polizaPlan: 'Salud Integral',
    estado: 'en-validacion',
    estadoSubtexto: 'Pendiente de revisión',
    horaIngreso: new Date(Date.now() - 1872000), // ~31 mins ago
    horaIngresoTexto: '09:10 AM'
  },
  {
    id: 'a4',
    paciente: { nombre: 'Sofía Martínez Rojas', id: '78912345' },
    motivoIngreso: 'Fractura de brazo',
    polizaNumero: 'POL-55667788',
    polizaPlan: 'Vida Salud',
    estado: 'notificada',
    estadoSubtexto: 'En proceso',
    horaIngreso: new Date(Date.now() - 2232000), // ~37 mins ago
    horaIngresoTexto: '09:04 AM'
  },
  {
    id: 'a5',
    paciente: { nombre: 'Diego Herrera Ruiz', id: '12378945' },
    motivoIngreso: 'Dificultad respiratoria',
    polizaNumero: 'POL-66778899',
    polizaPlan: 'Salud Total',
    estado: 'notificada',
    estadoSubtexto: 'En proceso',
    horaIngreso: new Date(Date.now() - 2532000), // ~42 mins ago
    horaIngresoTexto: '08:59 AM'
  }
];

export const MOCK_POLIZAS: PolizaCompleta[] = [
  {
    id: 'p1',
    paciente: { nombre: 'Juan Pérez Gómez', id: '78945612' },
    numeroPoliza: 'POL-12345678',
    aseguradora: 'Salud Integral',
    estado: 'valida',
    estadoSubtexto: 'Cobertura activa',
    fechaHora: '24/05/2024',
    horaIngreso: '09:35 AM',
    validaHasta: '24/05/2025'
  },
  {
    id: 'p2',
    paciente: { nombre: 'María López Silva', id: '45678923' },
    numeroPoliza: 'POL-87654321',
    aseguradora: 'Vida Salud',
    estado: 'en-validacion',
    estadoSubtexto: 'Revisión en curso',
    fechaHora: '24/05/2024',
    horaIngreso: '09:28 AM',
    validaHasta: null
  },
  {
    id: 'p3',
    paciente: { nombre: 'Carlos Ramírez Torres', id: '32165498' },
    numeroPoliza: 'POL-11223344',
    aseguradora: 'Salud Total',
    estado: 'valida',
    estadoSubtexto: 'Cobertura activa',
    fechaHora: '24/05/2024',
    horaIngreso: '09:21 AM',
    validaHasta: '12/03/2025'
  },
  {
    id: 'p4',
    paciente: { nombre: 'Ana Lucía Fernández', id: '65498731' },
    numeroPoliza: 'POL-44332211',
    aseguradora: 'Protección Familiar',
    estado: 'invalida',
    estadoSubtexto: 'No tiene cobertura',
    fechaHora: '24/05/2024',
    horaIngreso: '09:15 AM',
    validaHasta: null
  },
  {
    id: 'p5',
    paciente: { nombre: 'Luis Fernando Castro', id: '98765432' },
    numeroPoliza: 'POL-99887766',
    aseguradora: 'Salud Integral',
    estado: 'valida',
    estadoSubtexto: 'Cobertura activa',
    fechaHora: '24/05/2024',
    horaIngreso: '09:10 AM',
    validaHasta: '05/07/2025'
  },
  {
    id: 'p6',
    paciente: { nombre: 'Sofía Martínez Rojas', id: '78912345' },
    numeroPoliza: 'POL-55667788',
    aseguradora: 'Vida Salud',
    estado: 'en-validacion',
    estadoSubtexto: 'Documentos pendientes',
    fechaHora: '24/05/2024',
    horaIngreso: '09:05 AM',
    validaHasta: null
  },
  {
    id: 'p7',
    paciente: { nombre: 'Diego Herrera Ruiz', id: '12378945' },
    numeroPoliza: 'POL-66778899',
    aseguradora: 'Salud Total',
    estado: 'valida',
    estadoSubtexto: 'Cobertura activa',
    fechaHora: '24/05/2024',
    horaIngreso: '09:02 AM',
    validaHasta: '18/11/2025'
  }
];

export const MOCK_CASOS: CasoHistorial[] = [
  {
    id: 'CAS-2024-1287', pacienteId: '78945612',
    paciente: { nombre: 'Juan Pérez Gómez', id: '78945612' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:35 AM',
    motivoIngreso: 'Dolor abdominal',
    estado: 'cerrado', estadoSubtexto: 'Póliza válida',
    gestorAsignado: { nombre: 'Laura Martínez' },
    tiempoGestion: '00:04:32'
  },
  {
    id: 'CAS-2024-1286', pacienteId: '45678923',
    paciente: { nombre: 'María López Silva', id: '45678923' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:28 AM',
    motivoIngreso: 'Trauma leve',
    estado: 'en-proceso', estadoSubtexto: 'Revisión en curso',
    gestorAsignado: { nombre: 'Carlos Ramírez' },
    tiempoGestion: '00:07:15'
  },
  {
    id: 'CAS-2024-1285', pacienteId: '32165498',
    paciente: { nombre: 'Carlos Ramírez Torres', id: '32165498' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:21 AM',
    motivoIngreso: 'Fiebre alta',
    estado: 'cerrado', estadoSubtexto: 'Póliza válida',
    gestorAsignado: { nombre: 'Laura Martínez' },
    tiempoGestion: '00:03:41'
  },
  {
    id: 'CAS-2024-1284', pacienteId: '65498731',
    paciente: { nombre: 'Ana Lucía Fernández', id: '65498731' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:21 AM',
    motivoIngreso: 'Dolor en el pecho',
    estado: 'escalado', estadoSubtexto: 'Sin cobertura',
    gestorAsignado: { nombre: 'Diego Herrera' },
    tiempoGestion: '00:12:18'
  },
  {
    id: 'CAS-2024-1283', pacienteId: '98765432',
    paciente: { nombre: 'Luis Fernando Castro', id: '98765432' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:10 AM',
    motivoIngreso: 'Crisis hipertensiva',
    estado: 'cerrado', estadoSubtexto: 'Póliza válida',
    gestorAsignado: { nombre: 'Laura Martínez' },
    tiempoGestion: '00:05:02'
  },
  {
    id: 'CAS-2024-1282', pacienteId: '78912345',
    paciente: { nombre: 'Sofía Martínez Rojas', id: '78912345' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:05 AM',
    motivoIngreso: 'Fractura de brazo',
    estado: 'en-proceso', estadoSubtexto: 'Documentos pendientes',
    gestorAsignado: { nombre: 'Carlos Ramírez' },
    tiempoGestion: '00:08:47'
  },
  {
    id: 'CAS-2024-1281', pacienteId: '12378945',
    paciente: { nombre: 'Diego Herrera Ruiz', id: '12378945' },
    fechaIngreso: '24/05/2024', horaIngreso: '09:02 AM',
    motivoIngreso: 'Dificultad respiratoria',
    estado: 'cerrado', estadoSubtexto: 'Póliza válida',
    gestorAsignado: { nombre: 'Laura Martínez' },
    tiempoGestion: '00:04:19'
  }
];
