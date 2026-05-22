<<<<<<< Updated upstream
=======
import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar .env desde la raíz del proyecto (un nivel arriba de BackEnd/)
// Esto funciona tanto en local como en Render (donde el .env se inyecta como vars de entorno)
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
dotenv.config(); // fallback: busca .env en el CWD

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // En producción (Render) FRONTEND_URL es la URL del servicio
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Base de datos SQLite (en Render usar ruta relativa o volumen persistente)
  DATABASE_URL: z.string().min(1).default('file:./prisma/dev.db'),

  // Notion — requeridos para el funcionamiento del sistema
  NOTION_TOKEN: z.string().min(1).default(''),
  NOTION_ASEGURADOS_DB_ID: z.string().min(1).default(''),
  NOTION_POLIZAS_DB_ID: z.string().min(1).default(''),
  NOTION_ALERTAS_DB_ID: z.string().min(1).default(''),

  // IA — requeridos para el dictamen automático
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GROQ_API_KEY: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

  // Email — opcionales: si no están, el sistema funciona sin enviar correos
  SMTP_SERVER: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_SECURE: z.string().default('false').transform(val => val.toLowerCase() === 'true'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  DESTINATION_HOSPITAL: z.string().default('hospital_demo@yopmail.com'),
  DESTINATION_INSURANCE: z.string().default('seguro_demo@yopmail.com'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Variables de entorno inválidas:', parsedEnv.error.format());
  // No lanzamos error fatal — el servidor arranca con defaults y avisa
  console.warn('⚠️  El sistema arrancará con configuración incompleta');
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : envSchema.parse({ ...envSchema.shape }); // defaults de emergencia
>>>>>>> Stashed changes
