import { Ingreso, Notificacion } from '../shared/models';

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
