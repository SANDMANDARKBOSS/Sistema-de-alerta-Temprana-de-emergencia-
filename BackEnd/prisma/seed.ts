import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Limpiando base de datos local (SQLite) ---');
  await prisma.alerta.deleteMany();
  await prisma.poliza.deleteMany();
  await prisma.asegurado.deleteMany();

  const asegurados = [
    { nombre: 'Juan Carlos Pérez', cedula: '1712345678', polizaId: 'POL-1712-001', email: 'juan@test.com' },
    { nombre: 'María López Silva',  cedula: '0987654321', polizaId: 'POL-0987-002', email: 'maria@test.com' },
    { nombre: 'Carlos Ramírez',     cedula: '1798765432', polizaId: 'POL-1798-003', email: 'carlos@test.com' },
    { nombre: 'Ana Beltran', cedula: '9876543210', polizaId: 'POL-9876-004', email: 'ana@test.com' },
    { nombre: 'Roberto Cano', cedula: '5647382910', polizaId: 'POL-5647-005', email: 'roberto@test.com' },
  ];

  console.log('--- Poblando SQLite con 5 asegurados y sus pólizas ---');
  for (const a of asegurados) {
    await prisma.asegurado.create({ 
      data: { nombre: a.nombre, cedula: a.cedula, polizaId: a.polizaId, email: a.email } 
    });
    
    let estado = 'VIGENTE';
    if (a.polizaId.includes('002')) estado = 'VENCIDA';
    if (a.polizaId.includes('003')) estado = 'SUSPENDIDA';

    await prisma.poliza.create({
      data: {
        polizaId: a.polizaId,
        cedulaAsegurado: a.cedula,
        fechaInicio: new Date('2026-01-01'),
        fechaFin: estado === 'VENCIDA' ? new Date('2026-05-01') : new Date('2026-12-31'),
        estado,
        cobertura: 'Cobertura Integral de Salud',
        preExistencias: a.polizaId.includes('001') ? 'Hipertensión' : 'Ninguna',
        gestorAsignado: 'Laura Martínez',
        gestorEmail: 'laura.martinez@seguros.com'
      }
    });
  }

  // Crear 2 alertas de prueba para el dashboard
  console.log('--- Creando alertas de prueba en el historial ---');
  await prisma.alerta.create({
    data: {
      nombre: 'Juan Carlos Pérez',
      cedulaPaciente: '1712345678',
      polizaId: 'POL-1712-001',
      estadoPoliza: 'VIGENTE',
      hospital: 'Hospital Metropolitano',
      notificacionEnviada: true,
      resumenIA: 'Paciente con póliza vigente. Riesgo bajo.',
      gestorAsignado: 'Laura Martínez'
    }
  });

  await prisma.alerta.create({
    data: {
      nombre: 'María López Silva',
      cedulaPaciente: '0987654321',
      polizaId: 'POL-0987-002',
      estadoPoliza: 'VENCIDA',
      hospital: 'Clínica Kennedy',
      notificacionEnviada: true,
      resumenIA: 'Póliza vencida. Se requiere validación de pago.',
      gestorAsignado: 'Laura Martínez'
    }
  });

  console.log('✅ Base de datos poblada exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
