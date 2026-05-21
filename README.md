# Sistema de Alerta Temprana de Ingresos a Emergencias - Reto 4

## 🚀 Descripción
Esta solución es un **Agente IA Agéntico** que actúa como un Webhook inteligente para hospitales. Cuando un paciente ingresa a emergencias, el sistema valida automáticamente la póliza en Notion, analiza preexistencias con Google Gemini y notifica en tiempo real vía email al hospital y a la aseguradora.

## 🛠️ Tecnologías y Herramientas
*   **Lenguaje:** Python 3.10+
*   **IA/ML:** Google Gemini 1.5 Flash, LangChain
*   **Backend:** FastAPI + Uvicorn
*   **Base de Datos:** Notion API
*   **Notificaciones:** SMTP (Email)

## 📦 Instalación y Configuración

1. **Clonar el repositorio e ingresar a la carpeta:**
   ```bash
   cd project
   ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno:**
   Edita el archivo `.env` con tus credenciales reales:
   * `NOTION_API_KEY`: Token de integración de Notion.
   * `NOTION_DATABASE_ID`: ID de tu base de datos de pólizas.
   * `GOOGLE_API_KEY`: API Key de Google AI Studio.
   * `SMTP_USER` y `SMTP_PASSWORD`: Credenciales para envío de correos.

## 🖥️ Uso

1. **Iniciar el servidor del Webhook:**
   ```bash
   python -m src.main
   ```

2. **Simular un ingreso de emergencia:**
   Ejecuta el script de prueba en otra terminal:
   ```bash
   python mock_hospital_request.py
   ```

## 👥 Equipo
*   **Sebastian Yambay** - [Rol/LinkedIn]
