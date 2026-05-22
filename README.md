# 🏥 Sistema de Alerta Temprana de Ingresos a Emergencias

Un sistema inteligente que se activa cuando un asegurado ingresa a la emergencia del hospital. Un **agente de IA** revisa instantáneamente la validez de la póliza, el historial de pre-existencias y envía notificaciones al departamento de admisiones del hospital y al gestor de casos del seguro simultáneamente.

## ⚙️ Arquitectura

```
Hospital (Webhook) → Backend (Node.js/Express)
                       ├── Notion API (Base de datos)
                       ├── Agente IA (Groq / LLaMA 3.3)
                       ├── Email Service (SMTP)
                       └── Socket.IO → Frontend (Next.js)
```

## 🚀 Flujo del Sistema

1. **Webhook de Ingreso** — Se recibe la cédula del paciente, hospital y motivo de ingreso.
2. **Consulta a Notion** — Se busca al asegurado y su póliza asociada en la base de datos.
3. **Análisis IA** — El agente IA (LLaMA 3.3 vía Groq) evalúa la póliza, pre-existencias, cobertura y genera un dictamen de validación/rechazo con nivel de riesgo.
4. **Notificación Simultánea** — Se envían 3 correos en paralelo: al hospital, al gestor del seguro y al paciente asegurado.
5. **Registro en Tiempo Real** — La alerta se registra en Notion y se emite vía Socket.IO al panel del frontend.

## 🛠️ Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | Next.js 14, TypeScript, Framer Motion |
| Backend | Node.js, Express, Socket.IO |
| Base de Datos | Notion API |
| Inteligencia Artificial | Groq SDK (LLaMA 3.3 70B) |
| Email | Nodemailer (SMTP) |
| Estilos | Tailwind CSS |

## 📦 Instalación

### Backend
```bash
cd BackEnd
npm install
cp .env.example .env   # Configurar variables de entorno
npm run dev
```

### Frontend
```bash
cd FrontEnd
npm install
npm run dev
```

## 🔐 Variables de Entorno (BackEnd/.env)

| Variable | Descripción |
|---|---|
| `NOTION_TOKEN` | Token de integración de Notion |
| `NOTION_ASEGURADOS_DB_ID` | ID de la base de datos de asegurados |
| `NOTION_POLIZAS_DB_ID` | ID de la base de datos de pólizas |
| `NOTION_ALERTAS_DB_ID` | ID de la base de datos de alertas |
| `GROQ_API_KEY` | API Key de Groq para el agente IA |
| `SMTP_USER` | Correo SMTP para envío de emails |
| `SMTP_PASSWORD` | Contraseña del correo SMTP |
| `DESTINATION_HOSPITAL` | Email de notificación al hospital |
| `DESTINATION_INSURANCE` | Email de notificación al gestor |

## 👥 Equipo
* **Sebastian Yambay**
