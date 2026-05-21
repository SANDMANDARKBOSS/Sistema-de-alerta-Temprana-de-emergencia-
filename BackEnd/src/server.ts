import { Server } from 'socket.io';
import http from 'http';
import app from './app';
import { prisma } from './config/database';
import { env } from './config/env';
import nodemailer from 'nodemailer';

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*', // Permitir de cualquier origen para demo
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  });
});

server.listen(env.PORT, () => {
  console.log(`Servidor HTTP y Socket.IO corriendo en puerto ${env.PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
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
    .then(() => console.log('📧 SMTP verificado y listo para enviar emails'))
    .catch((err: Error) => console.error('📧 SMTP ERROR al verificar:', err.message));
} else {
  console.warn('📧 SMTP no configurado — los emails no se enviarán');
}
