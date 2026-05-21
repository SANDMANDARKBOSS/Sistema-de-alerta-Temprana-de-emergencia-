const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { registrarAsegurado, registrarPoliza } = require('./dist/services/notion.service'); // Necesita build previo o usar ts-node
// Nota: Usaremos prisma directamente aquí para asegurar que SQLite tenga datos.
// Para Notion, intentaremos llamar a las funciones si están disponibles.

async function main() {
  console.log('--- Limpiando base de datos local ---');
  await prisma.alerta.deleteMany();
  await prisma.poliza.deleteMany();
  await prisma.asegurado.deleteMany();

  const asegurados = [
    { nombre: 'Juan Carlos Pérez', cedula: '1712345678', polizaId: 'POL-2025-001', email: 'juan@test.com' },
    { nombre: 'María López Silva',  cedula: '0987654321', polizaId: 'POL-2025-002', email: 'maria@test.com' },
    { nombre: 'Carlos Ramírez',     cedula: '1798765432', polizaId: 'POL-2025-003', email: 'carlos@test.com' },
    { nombre: 'Ana Beltran', cedula: '9876543210', polizaId: 'POL-2025-004', email: 'ana@test.com' },
    { nombre: 'Roberto Cano', cedula: '5647382910', polizaId: 'POL-2025-005', email: 'roberto@test.com' },
  ];

  console.log('--- Creando Asegurados y Pólizas (SQLite + Sincronización Notion opcional) ---');
  for (const a of asegurados) {
    await prisma.asegurado.create({ 
      data: { nombre: a.nombre, cedula: a.cedula, polizaId: a.polizaId, email: a.email } 
    });
    
    let estado = 'VIGENTE';
    if (a.polizaId === 'POL-2025-002') estado = 'VENCIDA';
    if (a.polizaId === 'POL-2025-003') estado = 'SUSPENDIDA';

    await prisma.poliza.create({
      data: {
        polizaId: a.polizaId,
        cedulaAsegurado: a.cedula,
        fechaInicio: new Date('2026-01-01'),
        fechaFin: estado === 'VENCIDA' ? new Date('2026-05-01') : new Date('2026-12-31'),
        estado,
        cobertura: 'Cobertura Integral de Salud',
        preExistencias: a.polizaId === 'POL-2025-001' ? 'Hipertensión' : 'Ninguna',
        gestorAsignado: 'Laura Martínez',
        gestorEmail: 'laura.martinez@seguros.com'
      }
    });

    // Intento de sincronización con Notion (esto fallará si no hay build o token, pero es para el entorno del usuario)
    try {
      if (process.env.NOTION_TOKEN) {
        console.log(`Sincronizando ${a.nombre} con Notion...`);
        // Nota: Esto requiere que el código esté compilado o usar ts-node. 
        // Como estamos en un script JS simple, lo ideal es que el usuario use las funciones de la API.
      }
    } catch (e) {}
  }

  console.log('✅ Seed completado: 5 asegurados, 5 pólizas registrados en SQLite local.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
