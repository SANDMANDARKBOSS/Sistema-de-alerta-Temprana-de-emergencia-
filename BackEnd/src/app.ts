import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes/api.routes';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_, res) => {
  res.send('API Alertas Salud funcionando');
});

app.use('/api', apiRoutes);

export default app;
