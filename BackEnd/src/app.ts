import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< Updated upstream
app.get('/', (_, res) => {
  res.send('API Alertas Salud funcionando');
});

=======
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // En producción rechazamos orígenes no listados
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error(`CORS: origen no permitido: ${origin}`));
      }
      // En desarrollo permitimos cualquiera para facilitar pruebas
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

// ─── Seguridad con Helmet ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ─── Parseo y logging ─────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

// ─── Headers de seguridad adicionales ────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Health check rápido ──────────────────────────────────────────────────────
// En producción Next.js maneja "/", pero este endpoint siempre responde
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Manejo global de errores ─────────────────────────────────────────────────
// NOTA: mountNextApp() se llama en server.ts (es async) ANTES de .listen()
// Los handlers de Next.js se añaden al app después de este export.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error global]', err.message);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Error interno del servidor' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

>>>>>>> Stashed changes
export default app;
