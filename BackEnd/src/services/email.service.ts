import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface NotificacionEmailInput {
  hospital: string;
  cedula: string;
  nombrePaciente: string;
  polizaId: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  resumenIA?: string | null;
  gestorEmail?: string | null;
}

function getTransporter() {
  if (!env.emailRemitente || !env.emailPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    secure: env.emailSecure,
    auth: {
      user: env.emailRemitente,
      pass: env.emailPassword
    }
  });
}

export async function enviarNotificacionesSimultaneas(input: NotificacionEmailInput): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const hospitalEmail = env.emailHospitalDefault;
  const gestorEmail = input.gestorEmail ?? env.emailGestorDefault;

  const destinos = [hospitalEmail, gestorEmail].filter((email): email is string => Boolean(email));
  if (destinos.length === 0) {
    return false;
  }

  const subject = `[Alerta Urgencias] Ingreso de ${input.nombrePaciente}`;
  const html = `
    <h3>Alerta de ingreso a emergencias</h3>
    <p><strong>Hospital:</strong> ${input.hospital}</p>
    <p><strong>Paciente:</strong> ${input.nombrePaciente} (${input.cedula})</p>
    <p><strong>Póliza:</strong> ${input.polizaId} - ${input.estadoPoliza}</p>
    <p><strong>Preexistencias:</strong> ${input.preExistencias ?? 'Sin registro'}</p>
    <p><strong>Análisis IA:</strong> ${input.resumenIA ?? 'No disponible'}</p>
  `;

  await Promise.all(
    destinos.map((to) =>
      transporter.sendMail({
        from: env.emailRemitente,
        to,
        subject,
        html
      })
    )
  );

  return true;
}
