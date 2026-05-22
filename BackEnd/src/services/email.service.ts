import nodemailer from 'nodemailer';
import dns from 'dns';
import { env } from '../config/env';
import { AnalisisIA } from './ai.service';

// Forzar IPv4 para evitar errores ENETUNREACH en Render (que no soporta IPv6 saliente)
dns.setDefaultResultOrder('ipv4first');

export interface DatosNotificacion {
  nombrePaciente: string;
  cedula: string;
  polizaId: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  cobertura: string;
  hospital: string;
  motivoIngreso?: string;
  analisis: AnalisisIA;
  fechaHora: string;
}

let testAccount: nodemailer.TestAccount | null = null;
let testTransporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (env.SMTP_USER && env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: env.SMTP_SERVER,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: env.NODE_ENV === 'production'
      }
    });
  }

  // Ethereal Fallback
  if (!testAccount) {
    console.log('[Email] ⚠️ SMTP no configurado. Creando cuenta de prueba Ethereal (Fallback)...');
    testAccount = await nodemailer.createTestAccount();
    testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return testTransporter;
}

function buildHtml(datos: DatosNotificacion): string {
  const isUrgente = datos.analisis.validacion === 'RECHAZADA' || datos.analisis.riesgo === 'ALTO';
  const colorPrimario = '#1565C0';
  const colorRiesgo = isUrgente ? '#DC2626' : '#16A34A';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación de Ingreso</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; color: #1F2937;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
    
    <!-- Header -->
    <div style="background-color: ${colorPrimario}; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Sistema de Alerta Temprana</h1>
      <p style="margin: 8px 0 0 0; color: #E0E7FF; font-size: 14px;">Notificación de Ingreso a Emergencias</p>
    </div>

    <!-- Banner Urgencia (Si aplica) -->
    ${isUrgente ? `
    <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px 24px; display: flex; align-items: center;">
      <span style="font-size: 18px; margin-right: 12px;">⚠️</span>
      <div>
        <h3 style="margin: 0; color: #991B1B; font-size: 14px; font-weight: 700;">Atención Inmediata Requerida</h3>
        <p style="margin: 2px 0 0 0; color: #B91C1C; font-size: 13px;">Se ha detectado una situación de alto riesgo o inconsistencia en la póliza.</p>
      </div>
    </div>
    ` : ''}

    <!-- Contenido Principal -->
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4B5563;">
        Se ha registrado un nuevo ingreso en <strong style="color: #111827;">${datos.hospital}</strong>. A continuación, se detallan los datos del paciente y el análisis automatizado preliminar.
      </p>

      <!-- Tarjeta de Paciente -->
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Detalles del Paciente</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 40%; font-size: 14px; color: #64748B;">Nombre Completo</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${datos.nombrePaciente}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #64748B;">Documento ID</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${datos.cedula}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #64748B;">Hospital</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${datos.hospital}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #64748B;">Motivo / Síntomas</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #B91C1C;">${datos.motivoIngreso || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #64748B;">Póliza Activa</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${datos.polizaId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #64748B;">Estado de Póliza</td>
            <td style="padding: 8px 0;"><span style="background-color: ${datos.estadoPoliza === 'VIGENTE' ? '#DCFCE7' : '#FEE2E2'}; color: ${datos.estadoPoliza === 'VIGENTE' ? '#166534' : '#991B1B'}; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700;">${datos.estadoPoliza}</span></td>
          </tr>
        </table>
      </div>

      <!-- Tarjeta Análisis IA -->
      <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; position: relative;">
        <div style="position: absolute; top: -12px; left: 20px; background-color: #111827; color: #FFFFFF; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
          ✦ ANÁLISIS DE INTELIGENCIA ARTIFICIAL
        </div>
        
        <div style="margin-top: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Veredicto de Validación</div>
                <div style="font-size: 15px; font-weight: 700; color: ${datos.analisis.validacion === 'APROBADA' ? '#059669' : '#DC2626'};">${datos.analisis.validacion}</div>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Nivel de Riesgo</div>
                <div style="font-size: 15px; font-weight: 700; color: ${colorRiesgo};">${datos.analisis.riesgo}</div>
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 16px;">
            <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 6px;">Resumen Médico</div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; background-color: #F9FAFB; padding: 12px; border-radius: 6px; border-left: 3px solid #D1D5DB;">
              ${datos.analisis.resumen}
            </p>
          </div>
          
          <div style="margin-top: 16px;">
            <div style="font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 6px;">Recomendación del Sistema</div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
              ${datos.analisis.recomendaciones}
            </p>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="http://localhost:3000/alertas" style="display: inline-block; background-color: ${colorPrimario}; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(21, 101, 192, 0.2);">Ver Alerta en el Sistema</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; border-top: 1px solid #F3F4F6; padding: 24px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        Generado automáticamente el ${datos.fechaHora}<br>
        Este es un correo del sistema, por favor no responda directamente a esta dirección.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildPacienteHtml(datos: DatosNotificacion): string {
  const colorPrimario = '#1565C0';
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación de Ingreso Médico</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; color: #1F2937;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <div style="background-color: ${colorPrimario}; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700;">Tu Salud, Nuestra Prioridad</h1>
      <p style="margin: 8px 0 0 0; color: #E0E7FF; font-size: 14px;">Notificación Oficial de Ingreso</p>
    </div>

    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; margin-bottom: 16px; color: #111827;">Hola <strong>${datos.nombrePaciente}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #4B5563;">
        Te informamos que hemos registrado exitosamente tu ingreso en <strong>${datos.hospital}</strong> por el siguiente motivo de atención: <em>${datos.motivoIngreso || 'Atención de urgencia'}</em>.
      </p>
      
      <div style="background-color: ${datos.estadoPoliza === 'VIGENTE' ? '#F0FDF4' : '#FEF2F2'}; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid ${datos.estadoPoliza === 'VIGENTE' ? '#BBF7D0' : '#FECACA'};">
        <h3 style="margin: 0 0 8px 0; color: ${datos.estadoPoliza === 'VIGENTE' ? '#166534' : '#991B1B'}; font-size: 16px; font-weight: 700;">Estado de tu Póliza (${datos.polizaId})</h3>
        <p style="margin: 0; color: ${datos.estadoPoliza === 'VIGENTE' ? '#15803D' : '#DC2626'}; font-weight: 500; font-size: 14px; line-height: 1.5;">
          Tu póliza se encuentra actualmente <strong style="text-transform: uppercase;">${datos.estadoPoliza}</strong>.<br><br>
          ${datos.estadoPoliza === 'VIGENTE' 
            ? '✅ Puedes estar tranquilo/a. Nuestro sistema ya ha notificado al hospital y a tu gestor de seguros de manera simultánea para agilizar tu atención y cobertura médica.' 
            : '⚠️ Atención requerida: Tu póliza no está vigente. Por favor, comunícate con tu gestor de seguros lo antes posible para regularizar tu situación.'}
        </p>
      </div>

      <p style="font-size: 14px; color: #6B7280; font-style: italic;">
        Te deseamos una pronta recuperación. Estamos aquí para cuidarte.
      </p>
    </div>

    <div style="background-color: #F9FAFB; border-top: 1px solid #F3F4F6; padding: 20px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        Generado automáticamente el ${datos.fechaHora}<br>
        Sistema de Alerta Temprana de Emergencias
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

async function enviarConSendGrid(to: string, subject: string, html: string, rol: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject
          }
        ],
        from: {
          email: 'yambayjosue@gmail.com',
          name: 'Sistema Medix'
        },
        content: [
          {
            type: 'text/html',
            value: html
          }
        ]
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[SendGrid] ❌ Error HTTP enviando a ${rol} (${to}):`, errorText);
      return false;
    }

    console.log(`[SendGrid] ✅ Correo enviado exitosamente al ${rol} (${to})`);
    return true;
  } catch (error) {
    console.error(`[SendGrid] ❌ Excepción enviando a ${rol}:`, error);
    return false;
  }
}

export async function enviarNotificacionHospital(datos: DatosNotificacion): Promise<boolean> {
  const subject = `[ALERTA EMERGENCIA] ${datos.nombrePaciente} — Póliza ${datos.estadoPoliza}`;
  const to = env.DESTINATION_HOSPITAL || 'hospital_prueba@yopmail.com';

  if (env.SENDGRID_API_KEY) {
    return enviarConSendGrid(to, subject, buildHtml(datos), 'Hospital');
  }

  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const from = env.SMTP_USER ? `"Sistema Alertas Salud" <${env.SMTP_USER}>` : '"Sistema Alertas Salud" <alerta_prueba@yopmail.com>';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: buildHtml(datos)
    });
    
    if (!env.SMTP_USER) {
       console.log(`[Email] 📧 Correo de prueba enviado a Hospital. Visualizar aquí: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
       console.log(`[Email] ✅ Correo enviado exitosamente al Hospital (${to})`);
    }
    
    return true;
  } catch (error) {
    console.error('[Email] ❌ Error enviando a hospital:', error);
    return false;
  }
}

export async function enviarNotificacionGestor(datos: DatosNotificacion): Promise<boolean> {
  const subject = `[ALERTA EMERGENCIA] ${datos.nombrePaciente} — Póliza ${datos.estadoPoliza}`;
  const to = env.DESTINATION_INSURANCE || 'gestor_seguros@yopmail.com';

  if (env.SENDGRID_API_KEY) {
    return enviarConSendGrid(to, subject, buildHtml(datos), 'Gestor');
  }

  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const from = env.SMTP_USER ? `"Sistema Alertas Salud" <${env.SMTP_USER}>` : '"Sistema Alertas Salud" <alerta_prueba@yopmail.com>';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: buildHtml(datos)
    });

    if (!env.SMTP_USER) {
      console.log(`[Email] 📧 Correo de prueba enviado a Gestor. Visualizar aquí: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[Email] ✅ Correo enviado exitosamente al Gestor (${to})`);
    }

    return true;
  } catch (error) {
    console.error('[Email] ❌ Error enviando a gestor:', error);
    return false;
  }
}

export async function enviarNotificacionPaciente(datos: DatosNotificacion, emailPaciente: string): Promise<boolean> {
  const subject = `[ALERTA EMERGENCIA] Notificación de Ingreso - Póliza ${datos.estadoPoliza}`;
  const to = env.SMTP_USER ? emailPaciente : (emailPaciente || 'paciente_prueba@yopmail.com');

  if (env.SENDGRID_API_KEY) {
    return enviarConSendGrid(to, subject, buildPacienteHtml(datos), 'Paciente');
  }

  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const from = env.SMTP_USER ? `"Sistema Alertas Salud" <${env.SMTP_USER}>` : '"Sistema Alertas Salud" <alerta_prueba@yopmail.com>';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: buildPacienteHtml(datos)
    });

    if (!env.SMTP_USER) {
      console.log(`[Email] 📧 Correo de prueba enviado a PACIENTE (${emailPaciente}). Visualizar aquí: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[Email] ✅ Correo enviado exitosamente al PACIENTE (${to})`);
    }

    return true;
  } catch (error) {
    console.error('[Email] ❌ Error enviando a paciente:', error);
    return false;
  }
}
