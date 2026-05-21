import app from './app';
import { prisma } from './config/database';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`Servidor corriendo en puerto ${env.port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
