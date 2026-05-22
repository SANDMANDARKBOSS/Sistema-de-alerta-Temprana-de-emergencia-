import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  
  NOTION_TOKEN: z.string().min(1),
  NOTION_ASEGURADOS_DB_ID: z.string().min(1),
  NOTION_POLIZAS_DB_ID: z.string().min(1),
  NOTION_ALERTAS_DB_ID: z.string().min(1),
  
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GROQ_API_KEY: z.string().min(1),
  GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
  
  SMTP_SERVER: z.string().min(1).default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_SECURE: z.string().default('false').transform(val => val.toLowerCase() === 'true'),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
  
  DESTINATION_HOSPITAL: z.string().email(),
  DESTINATION_INSURANCE: z.string().email(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
