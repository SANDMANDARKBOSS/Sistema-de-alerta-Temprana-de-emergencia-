import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes/api.routes';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl
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
