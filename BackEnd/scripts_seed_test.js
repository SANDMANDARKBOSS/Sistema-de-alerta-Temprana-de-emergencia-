const { PrismaClient, EstadoPoliza } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.alerta.deleteMany();
  await prisma.poliza.deleteMany();
  await prisma.asegurado.deleteMany();

  await prisma.asegurado.create({
    data: {
      nombre: 'Juan Perez Gomez',
      cedula: '78945612',
      polizaId: 'POL-2026-0001',
      email: 'juan.perez@email.com',
      telefono: '+573001112233'
    }
  });

  await prisma.poliza.create({
    data: {
      polizaId: 'POL-2026-0001',
      cedulaAsegurado: '78945612',
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
      fechaFin: new Date('2026-12-31T23:59:59.000Z'),
      estado: EstadoPoliza.VIGENTE,
      cobertura: 'Urgencias y hospitalizacion',
      preExistencias: 'Hipertension controlada',
      gestorAsignado: 'Laura Martinez',
      gestorEmail: 'gestor_demo@yopmail.com'
    }
  });

  console.log('Seed OK');
}

main().finally(() => prisma.$disconnect());
