import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AnalisisIA } from './ai.service';

export interface DatosNotificacion {
  nombrePaciente: string;
  cedula: string;
  polizaId: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  cobertura: string;
  hospital: string;
  analisis: AnalisisIA;
  fechaHora: string;
}

function getTransporter() {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.warn('[Email] ⚠️ SMTP no configurado (faltan SMTP_USER / SMTP_PASSWORD). Email desactivado.');
    return null;
  }

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

function buildHtml(datos: DatosNotificacion): string {
  const isUrgente = datos.analisis.validacion === 'RECHAZADA' || datos.analisis.riesgo === 'ALTO';
  const colorBorde = isUrgente ? '#DC2626' : '#16A34A';
  const banderaUrgencia = isUrgente ? `<div style="background: #FEF2F2; color: #DC2626; padding: 10px; font-weight: bold; text-align: center; border-bottom: 1px solid #FCA5A5;">⚠️ ATENCIÓN URGENTE REQUERIDA</div>` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-top: 5px solid ${colorBorde};">
        ${banderaUrgencia}
        <div style="background: #1565C0; padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">🚨 Alerta de Ingreso a Emergencias</h2>
          <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;">Fecha: ${datos.fechaHora}</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280; width: 160px;">🏥 Hospital</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111827;">${datos.hospital}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280;">👤 Paciente</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111827;">${datos.nombrePaciente} <span style="color:#6B7280; font-weight:normal;">(${datos.cedula})</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280;">📋 Póliza</td>
              <td style="padding: 10px 0; color: #111827;">${datos.polizaId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280;">Estado Póliza</td>
              <td style="padding: 10px 0; font-weight: bold;">${datos.estadoPoliza}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280;">🛡️ Cobertura</td>
              <td style="padding: 10px 0; color: #111827;">${datos.cobertura}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #6B7280;">⚕️ Preexistencias</td>
              <td style="padding: 10px 0; color: #111827;">${datos.preExistencias ?? 'Ninguna'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 16px 0 0;">
                <div style="background: #EFF6FF; border-left: 4px solid #1565C0; padding: 12px 16px; border-radius: 4px;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #1565C0;">🤖 Análisis de IA</p>
                  <p style="margin: 0 0 4px; color: #374151; font-size: 13px;"><strong>Validación:</strong> ${datos.analisis.validacion}</p>
                  <p style="margin: 0 0 4px; color: #374151; font-size: 13px;"><strong>Riesgo:</strong> ${datos.analisis.riesgo}</p>
                  <p style="margin: 0 0 4px; color: #374151; font-size: 13px;"><strong>Resumen:</strong> ${datos.analisis.resumen}</p>
                  <p style="margin: 0; color: #374151; font-size: 13px;"><strong>Recomendaciones:</strong> ${datos.analisis.recomendaciones}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function enviarNotificacionHospital(datos: DatosNotificacion): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter || !env.DESTINATION_HOSPITAL) return false;

  const subject = `[ALERTA EMERGENCIA] ${datos.nombrePaciente} — Póliza ${datos.estadoPoliza}`;
  try {
    await transporter.sendMail({
      from: `"Sistema Alertas Salud" <${env.SMTP_USER}>`,
      to: env.DESTINATION_HOSPITAL,
      subject,
      html: buildHtml(datos)
    });
    return true;
  } catch (error) {
    console.error('[Email] ❌ Error enviando a hospital:', error);
    return false;
  }
}

export async function enviarNotificacionGestor(datos: DatosNotificacion): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter || !env.DESTINATION_INSURANCE) return false;

  const subject = `[ALERTA EMERGENCIA] ${datos.nombrePaciente} — Póliza ${datos.estadoPoliza}`;
  try {
    await transporter.sendMail({
      from: `"Sistema Alertas Salud" <${env.SMTP_USER}>`,
      to: env.DESTINATION_INSURANCE,
      subject,
      html: buildHtml(datos)
    });
    return true;
  } catch (error) {
    console.error('[Email] ❌ Error enviando a gestor:', error);
    return false;
  }
}
