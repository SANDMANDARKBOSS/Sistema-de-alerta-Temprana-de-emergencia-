import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta variable de entorno obligatoria: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  databaseUrl: process.env.DATABASE_URL as string,

  notionToken: process.env.NOTION_TOKEN,
  notionAseguradosDbId: process.env.NOTION_ASEGURADOS_DB_ID,
  notionPolizasDbId: process.env.NOTION_POLIZAS_DB_ID,
  notionAlertasDbId: process.env.NOTION_ALERTAS_DB_ID,

  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',

  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',

  emailHost: process.env.SMTP_SERVER ?? process.env.EMAIL_HOST ?? 'smtp.gmail.com',
  emailPort: Number(process.env.SMTP_PORT ?? process.env.EMAIL_PORT ?? 587),
  emailSecure:
    (process.env.SMTP_SECURE ?? process.env.EMAIL_SECURE ?? 'false').toLowerCase() === 'true',
  emailRemitente: process.env.SMTP_USER ?? process.env.EMAIL_REMITENTE,
  emailPassword: process.env.SMTP_PASSWORD ?? process.env.EMAIL_PASSWORD,

  emailHospitalDefault:
    process.env.DESTINATION_HOSPITAL ?? process.env.EMAIL_HOSPITAL_DEFAULT,
  emailGestorDefault:
    process.env.DESTINATION_INSURANCE ?? process.env.EMAIL_GESTOR_DEFAULT
};
