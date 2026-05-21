Sistema de Alerta Temprana de Ingresos a Emergencias · Viamatica

Stack: Next.js 15 · TypeScript · Express 5 · Prisma · SQLite · Notion API · Gemini/Groq · Nodemailer

⚠️ REGLA DE ORO: NO tocar ni leer los archivos .env del BackEnd ni del FrontEnd. Solo leer .env.example si necesitas contexto. Las claves API ya están configuradas.

📋 Contexto general del proyecto
El proyecto es un Sistema de Alerta Temprana de Ingresos a Emergencias Hospitalarias. Cuando un asegurado ingresa a urgencias, un webhook se activa, un agente de IA verifica la validez de la póliza y envía notificaciones simultáneas al hospital y al gestor del seguro.


Bases de datos en Notion (solo lectura/escritura via API, nunca editar IDs):

Asegurados: 36726cdda1ac80b480bdd3d5ec9450fa
Pólizas: 36726cdda1ac8043b7b5d7402d0b725d
Alertas de Emergencia: 36726cdda1ac80bebb85cd3d17a8543c

Estado actual detectado: Los archivos fuente (.ts/.tsx) están vacíos por corrupción en la exportación del RAR. Solo existen blobs de git con código parcial de algunos componentes y el Prisma schema. El dist/ compilado también está vacío. Todo necesita ser reconstruido desde cero usando los blobs recuperados como referencia de diseño/estructura.

🗂️ Estructura del proyecto
Sistema-de-alerta-Temprana-de-emergencia-/
├── BackEnd/
│   ├── src/
│   │   ├── app.ts               ← Express app setup + CORS + middlewares
│   │   ├── server.ts            ← HTTP + Socket.IO server
│   │   ├── config/
│   │   │   ├── env.ts           ← Leer process.env con validación Zod
│   │   │   └── database.ts      ← Prisma client singleton
│   │   ├── routes/
│   │   │   └── api.routes.ts    ← Registro de todas las rutas
│   │   ├── services/
│   │   │   ├── ai.service.ts    ← Gemini + Groq (análisis de pólizas)
│   │   │   ├── email.service.ts ← Nodemailer SMTP Gmail
│   │   │   └── notion.service.ts← Notion SDK (lectura Asegurados/Pólizas, escritura Alertas)
│   │   ├── webhooks/
│   │   │   └── emergencyWebhook.ts ← Endpoint POST /api/webhook/ingreso
│   │   ├── shared/responses/
│   │   │   └── response.ts      ← Helpers de respuesta estandarizada
│   │   └── types/
│   │       └── api.ts           ← Tipos TypeScript del dominio
│   ├── prisma/
│   │   ├── schema.prisma        ← Modelos: Asegurado, Poliza, Alerta (SQLite)
│   │   └── dev.db               ← Base local SQLite
│   └── scripts_seed_test.js     ← Script de seed/test de BD
│
└── FrontEnd/
    └── src/
        ├── app/
        │   ├── layout.tsx        ← Root layout con MainLayout
        │   ├── page.tsx          ← Redirect → /dashboard
        │   ├── dashboard/page.tsx
        │   ├── ingresos/page.tsx
        │   ├── alertas/page.tsx
        │   ├── polizas/page.tsx
        │   ├── historial/page.tsx
        │   ├── reportes/page.tsx
        │   ├── gestores/page.tsx
        │   ├── config/page.tsx
        │   └── login/page.tsx    ← Sin autenticación real, solo UI demo
        ├── components/           ← 20+ componentes
        ├── services/
        │   ├── api/client.ts     ← fetch wrapper hacia BackEnd
        │   └── mock-data.ts      ← Datos de demo
        ├── shared/models/index.ts← Interfaces TypeScript del dominio
        └── config/
            ├── constants/        ← API_URL y constantes globales
            └── routes/           ← Rutas del FrontEnd
🔧 BackEnd — Cambios y reconstrucción completa
1. src/config/env.ts — Variables de entorno tipadas
Crear validación con Zod de todas las variables. Exportar objeto tipado env que el resto del código consuma.

// Variables que deben estar presentes:
PORT, NODE_ENV, FRONTEND_URL, DATABASE_URL
NOTION_TOKEN, NOTION_ASEGURADOS_DB_ID, NOTION_POLIZAS_DB_ID, NOTION_ALERTAS_DB_ID
GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, GROQ_MODEL
SMTP_SERVER, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD
DESTINATION_HOSPITAL, DESTINATION_INSURANCE
2. src/config/database.ts — Prisma client
Singleton del PrismaClient. Usar patrón de instancia global para dev (evitar múltiples conexiones en hot-reload). Exportar prisma.

3. src/services/notion.service.ts — Servicio Notion
Este es el servicio más crítico. Instanciar @notionhq/client con el token del env. Implementar:

buscarAseguradoPorCedula(cedula: string) → consulta BD Asegurados filtrando por propiedad Cedula
buscarPolizaPorId(polizaId: string) → consulta BD Pólizas filtrando por Poliza_ID
crearAlertaEmergencia(data: AlertaData) → crea registro en BD Alertas con todos los campos del schema
actualizarNotificacionAlerta(alertaId: string) → marca Notificacion_Enviada = true
obtenerTodasLasAlertas() → lista alertas para el dashboard
obtenerTodasLasPolizas() → lista pólizas para el módulo de pólizas

El nombre de la alerta debe seguir el patrón: ALERTA-{cedula}-{fecha_YYYY-MM-DD}


Agregar logs internos tipo: [Notion] Buscando asegurado: {cedula}, [Notion] Póliza encontrada: {polizaId} Estado: {estado}. Estos aparecerán en consola del servidor y también serán enviados al FrontEnd vía Socket.IO.

4. src/services/ai.service.ts — Agente IA (Gemini + Groq)
Implementar análisis inteligente de la póliza. Lógica:

Intentar primero con Gemini (gemini-1.5-flash). Si falla o no hay clave, fallback a Groq (llama-3.1-8b-instant).
Prompt al modelo: recibe nombre del paciente, estado de póliza, pre-existencias, cobertura. Debe retornar JSON con: { validacion: "APROBADA"|"RECHAZADA"|"REVISION", resumen: string, recomendaciones: string, riesgo: "ALTO"|"MEDIO"|"BAJO" }
Función principal: analizarPoliza(datos: DatosPoliza): Promise<AnalisisIA>
Logs visibles: [IA] Usando modelo: gemini-1.5-flash, [IA] Análisis completado en {ms}ms, [IA] Fallback activado → Groq

La respuesta de la IA se incluirá en el email de notificación y se guardará en el registro de Notion.

5. src/services/email.service.ts — Nodemailer Gmail
Transporter SMTP apuntando a Gmail. Dos funciones de envío:

enviarNotificacionHospital(datos) → destino: DESTINATION_HOSPITAL del env
enviarNotificacionGestor(datos) → destino: DESTINATION_INSURANCE del env

Ambas se envían en paralelo (Promise.all). El email debe tener:

Asunto: [ALERTA EMERGENCIA] {nombre_paciente} — Póliza {estado}
HTML profesional con: nombre, cédula, póliza ID, estado, pre-existencias, cobertura, hospital, resultado análisis IA, fecha/hora, recomendaciones.
Log: [Email] Notificaciones enviadas a hospital y gestor ✓

El revisor probará que llegue el correo. Asegurarse de que el HTML sea legible y profesional. Incluir bandera de urgencia si el estado es RECHAZADA o riesgo ALTO.

6. src/webhooks/emergencyWebhook.ts — Flujo principal
Este es el corazón del sistema. Endpoint: POST /api/webhook/ingreso

Payload de entrada: { cedula: string, hospital: string }


Flujo completo con emisión de eventos Socket.IO en cada paso:

1
Validar payload con Zod. Emitir: socket.emit('log', { tipo: 'inicio', mensaje: 'Webhook recibido: cédula {cedula}' })

2
Buscar asegurado en Notion. Emitir log de búsqueda. Si no existe → responder 404 + log error.

3
Buscar póliza asociada. Verificar estado (VIGENTE/VENCIDA). Emitir log con resultado.

4
Llamar a ai.service.analizarPoliza(). Emitir log: 'Agente IA analizando...' y luego resultado.

5
Crear alerta en Notion vía notion.service.crearAlertaEmergencia(). Emitir log de creación.

6
Enviar emails en paralelo. Actualizar campo Notificacion_Enviada. Emitir log de éxito.

7
Emitir evento global socket.emit('nueva-alerta', alertaData) para que el FrontEnd refresque en tiempo real.

8
Responder 200 con resumen completo del procesamiento incluyendo análisis IA.

7. src/routes/api.routes.ts — Rutas completas
Registrar todos los endpoints necesarios para el FrontEnd:

POST /api/webhook/ingreso         ← webhook principal
GET  /api/alertas                  ← lista alertas de Notion
GET  /api/polizas                  ← lista pólizas de Notion
GET  /api/historial                ← alias para alertas procesadas
GET  /api/gestores                 ← gestores registrados (mock + datos env)
GET  /api/dashboard/metricas       ← métricas calculadas para el dashboard
GET  /api/config                   ← config del sistema desde Prisma
PUT  /api/config                   ← actualizar config
GET  /api/health                   ← health check para el revisor
8. src/app.ts y src/server.ts
app.ts: Express con helmet, cors (permitir origin del FrontEnd), morgan, express.json(), registro de rutas.

server.ts: Crear HTTP server, adjuntar Socket.IO con CORS configurado, escuchar en PORT del env. Exponer instancia de io para uso en webhooks.

🎨 FrontEnd — Cambios, animaciones y navegación
⚠️ La navegación actual se "cuelga" al cambiar de pestaña. La causa probable: cada página hace fetch en mount sin Suspense ni loading state. Solución: añadir loading.tsx por ruta y usar router.prefetch() en el Sidebar.

1. Instalar dependencias de animación
cd FrontEnd
npm install framer-motion animejs @types/animejs
Framer Motion: transiciones de página y componentes. Anime.js: animaciones de números (counters), gráficos de carga, efectos específicos.

2. src/app/layout.tsx — Root Layout
Envolver el children con un AnimatePresence de Framer Motion para transiciones suaves entre páginas. Configurar fuentes correctas (no usar Inter — usar Geist que ya está en el stack de Next.js 15).

// Patrón de transición de página:
<AnimatePresence mode="wait">
  <motion.div key={pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
    exit={{opacity:0,y:-8}} transition={{duration:0.18}}>
    {children}
  </motion.div>
</AnimatePresence>
3. src/components/sidebar/Sidebar.tsx — Navegación sin cuelgue
Cambios críticos:

Conectar los href # → rutas reales: /reportes, /gestores, /config
Usar useRouter para prefetch de todas las rutas al montar el Sidebar
Añadir indicador de carga en el ítem activo mientras navega (spinner pequeño inline)
Animación con Framer Motion: el indicador azul de ítem activo hace layoutId="active-indicator" para transición suave entre ítems
El usuario "Laura Martínez" y "LM" reemplazar por datos reales del env o mantener como demo pero conectado
4. Crear loading.tsx en cada ruta
En cada carpeta de ruta (dashboard/, ingresos/, alertas/, polizas/, historial/, reportes/, gestores/, config/) crear loading.tsx:

// Skeleton loader específico por sección
// Usar animación pulse de Tailwind + Framer Motion stagger
// Imitar la estructura real de la página (cards, tablas, etc.)
5. src/app/ingresos/page.tsx — Ingresos en Tiempo Real
Conectar con Socket.IO (socket.io-client) para recibir evento nueva-alerta y actualizar la tabla en tiempo real sin recargar. Instalar: npm install socket.io-client.

Añadir indicador "🟢 Conectado" / "🔴 Desconectado" en el header de la página
Cuando llega una nueva alerta, el nuevo row aparece con animación slide-down (Framer Motion)
Agregar formulario demo para disparar el webhook manualmente: inputs cédula + hospital + botón "Simular Ingreso"
6. src/app/alertas/page.tsx — Alertas Activas
Conectar con GET /api/alertas. El cronómetro ya existe en TablaAlertas.tsx. Añadir:

Badge pulsante animado para alertas con póliza VENCIDA (Anime.js pulse)
Sonido de alerta opcional (toggle)
Modal de detalle al hacer clic: mostrar análisis IA completo, resumen, recomendaciones
7. src/app/reportes/page.tsx — Reportes con animaciones de carga
Este módulo debe tener las mejores animaciones. Actualmente usa solo mock data. Cambios:

Contador animado en las tarjetas métricas: al cargar, los números cuentan desde 0 hasta el valor real (Anime.js anime({targets, innerText: [...], round: 1, easing: 'easeOutExpo', duration: 1200}))
Skeleton loaders mientras cargan los datos: barras animadas que imitan la forma de las gráficas
Gráfica de barras (recharts ya instalado): las barras crecen desde 0 con animación de entrada (isAnimationActive)
Gráfica de línea: línea que se dibuja progresivamente
Botón de descarga: exportar tabla como CSV real (no solo UI)
Conectar con GET /api/dashboard/metricas para datos reales
8. src/app/dashboard/page.tsx — Dashboard principal
Conectar con GET /api/dashboard/metricas
Contadores animados en MetricCards (Anime.js)
Stagger animation en cards (Framer Motion: cada card entra con delay +50ms)
Indicador de última actualización con refresh automático cada 30s
9. src/app/login/page.tsx — Sin autenticación real
Redireccionar directamente a /dashboard al montar. No necesita lógica de auth. Solo mostrar splash de 1.5s con el logo del sistema y luego redirigir. Esto permite que el revisor entre directamente sin login.

10. src/app/page.tsx — Root redirect
// Simplemente:
import { redirect } from 'next/navigation'
export default function Home() { redirect('/dashboard') }
11. src/components/layout/MainLayout.tsx
Wrapper con Sidebar fijo + área de contenido con scroll. Asegurarse que el padding-left sea exactamente 220px (ancho del Sidebar). Sin overflow hidden que cause el cuelgue de navegación.

🌐 Panel de Logs IA (nuevo componente)
Crear componente src/components/panel-logs-ia/PanelLogsIA.tsx

Este panel se mostrará en la página de Ingresos y/o como drawer global. Muestra los logs del servidor en tiempo real via Socket.IO. Debe verse como parte del sistema, no como una consola de debug.


Diseño: panel lateral o inferior con fondo oscuro (#0F172A), fuente monospace, logs con colores según tipo:

Tipo de log	Color	Prefijo
inicio	Azul	🔵 WEBHOOK
notion	Púrpura	🟣 NOTION
ia	Ámbar	🟡 AGENTE IA
email	Verde	🟢 EMAIL
error	Rojo	🔴 ERROR
success	Verde brillante	✅ COMPLETADO

Cada log nuevo aparece con animación slide-in desde abajo. Auto-scroll al último. Toggle para mostrar/ocultar. Botón "Limpiar logs".


El revisor debe poder ver visualmente cómo el agente IA procesa una alerta en tiempo real. Este panel es clave para demostrar el uso de IA.

🗄️ Base de Datos — Cómo poblarla por consola
El revisor podrá probar el sistema sin login. Para que funcione end-to-end necesita datos en Notion y en SQLite.


Setup inicial (una sola vez):
cd BackEnd
npm install
npx prisma generate
npx prisma db push     # Crea las tablas en dev.db
node scripts_seed_test.js  # Puebla SQLite con datos de prueba

El archivo BackEnd/scripts_seed_test.js debe hacer:
// 1. Crear asegurados de prueba en SQLite (Prisma)
// 2. Crear pólizas asociadas
// 3. (Opcional) Crear alertas de ejemplo
// 4. Imprimir resumen: "✅ Seed completado: 5 asegurados, 5 pólizas"

// Datos de prueba mínimos:
const asegurados = [
  { nombre: 'Juan Carlos Pérez', cedula: '1712345678', polizaId: 'POL-2025-001', email: 'juan@test.com' },
  { nombre: 'María López Silva',  cedula: '0987654321', polizaId: 'POL-2025-002', email: 'maria@test.com' },
  { nombre: 'Carlos Ramírez',     cedula: '1798765432', polizaId: 'POL-2025-003', email: 'carlos@test.com' },
]
// Pólizas: una vigente, una vencida, una suspendida
// Para probar el flujo completo con el webhook

Probar el webhook directamente desde consola:
# Una vez corriendo el servidor (npm run dev en BackEnd):
curl -X POST http://localhost:4000/api/webhook/ingreso \
  -H "Content-Type: application/json" \
  -d '{"cedula": "1712345678", "hospital": "Hospital Metropolitano"}'

# Debe responder con el análisis IA y confirmar envío de emails

Comandos de desarrollo:
cd BackEnd && npm run dev     # BackEnd en puerto 4000 con hot-reload
cd FrontEnd && npm run dev    # FrontEnd en puerto 3000
# Abrir: http://localhost:3000 → redirige a /dashboard automáticamente
✅ Checklist del revisor hackIAthon
Basado en los criterios del hackIAthon, el sistema debe poder demostrar:


Criterio	Cómo verificarlo	Estado objetivo
Webhook activado	POST a /api/webhook/ingreso	Funcional
Validación de póliza	Respuesta JSON con estado + análisis IA	Funcional
Uso real de IA	Panel de logs muestra llamada a Gemini/Groq	Añadir logs
Envío de correo	Revisar inbox de DESTINATION_HOSPITAL y DESTINATION_INSURANCE	Verificar SMTP
Registro en Notion	Ver BD Alertas en Notion con nuevo registro	Completar servicio
Dashboard en tiempo real	Abrir /ingresos, disparar webhook, ver actualización	Socket.IO
Reportes con datos	Página /reportes muestra gráficas con animaciones	Animaciones
Navegación fluida	Cambiar entre todas las pestañas sin cuelgue	Fix urgente
Sin login	Acceder a http://localhost:3000 directo al dashboard	Redirect
🚫 No tocar
• BackEnd/.env — Contiene claves API reales. Solo leer, nunca editar.
• FrontEnd/.env — Idem.
• BackEnd/prisma/dev.db — Puede leerse para inspeccionar, no borrar.
• IDs de bases de datos Notion — Los IDs en el .env.example son los correctos.