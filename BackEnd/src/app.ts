import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes/api.routes';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (curl, herramientas internas, mismo servidor)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // En producción rechazamos orígenes desconocidos
      callback(new Error(`CORS: origen no permitido: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

// ─── Seguridad con Helmet ──────────────────────────────────────────────────────
// Helmet añade headers que protegen contra clickjacking, sniffing, XSS, etc.
app.use(
  helmet({
    contentSecurityPolicy: false, // Desactivado para no romper la API REST
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ─── Parseo y logging ─────────────────────────────────────────────────────────
app.use(morgan('dev'));

// Limitar tamaño del body para evitar ataques de payload masivo
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

// ─── Cabeceras de seguridad adicionales ───────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Health rápido sin pasar por autenticación ────────────────────────────────
app.get('/', (_: Request, res: Response) => {
  res.send('API Alertas Salud funcionando');
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Manejo global de errores ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error global]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
