import { Ingreso, Notificacion, IngresoCompleto, AlertaActiva, ResumenAlertas } from '../shared/models';

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
