import { Server } from 'socket.io';
import http from 'http';
import app from './app';
import { mountNextApp } from './middlewares/nextServer';
import { prisma } from './config/database';
import { env } from './config/env';
import nodemailer from 'nodemailer';

// Render inyecta PORT=10000 automáticamente en producción.
// En local usamos 4000.
const PORT = parseInt(process.env.PORT || '4000', 10);

const server = http.createServer(app);

// Socket.IO
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

export const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  });
});

async function start() {
  // Montar Next.js ANTES de empezar a escuchar
  // En producción: prepara el servidor Next.js y agrega rutas al Express app
  // En desarrollo: no hace nada (Next.js corre en puerto 3000 aparte)
  await mountNextApp(app);

  // 0.0.0.0 es OBLIGATORIO en Render para recibir tráfico externo
  server.listen(PORT, '0.0.0.0', () => {
    const isProd = process.env.NODE_ENV === 'production';
    console.log('');
    console.log(`✅ Servidor listo en modo ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log(`   Puerto: ${PORT}`);
    if (isProd) {
      console.log(`   URL:    ${env.FRONTEND_URL}`);
      console.log('   Frontend y API corriendo en el mismo proceso ✓');
    } else {
      console.log(`   API:      http://localhost:${PORT}/api`);
      console.log('   Frontend: http://localhost:3000 (next dev)');
    }
    console.log('');
  });
}

// Manejo de señales de apagado limpio (Render envía SIGTERM al hacer deploy)
async function shutdown() {
  console.log('\n[Servidor] Apagando limpiamente...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('[Servidor] Cerrado.');
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Verificar SMTP al arranque
if (env.SMTP_USER && env.SMTP_PASSWORD) {
  const verifyTransport = nodemailer.createTransport({
    host: env.SMTP_SERVER,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
  });
  verifyTransport.verify()
    .then(() => console.log('📧 SMTP verificado y listo'))
    .catch((err: Error) => console.error('📧 SMTP ERROR:', err.message));
} else {
  console.warn('📧 SMTP no configurado — emails desactivados');
}

// Arrancar el servidor
start().catch((err) => {
  console.error('❌ Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
