import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { env } from '../config/env';

export interface DatosPoliza {
  nombrePaciente: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  cobertura: string;
  hospital: string;
}

export interface AnalisisIA {
  validacion: 'APROBADA' | 'RECHAZADA' | 'REVISION';
  resumen: string;
  recomendaciones: string;
  riesgo: 'ALTO' | 'MEDIO' | 'BAJO';
}

const promptBase = `
Actúas como un agente experto en evaluación de riesgos de seguros médicos y autorizaciones de emergencias.
Analiza la siguiente información de un ingreso a emergencia hospitalaria:

Nombre del Paciente: {nombrePaciente}
Estado de la Póliza: {estadoPoliza}
Pre-existencias: {preExistencias}
Cobertura: {cobertura}
Hospital: {hospital}

Retorna ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin markdown, sin texto adicional:
{
  "validacion": "APROBADA" | "RECHAZADA" | "REVISION",
  "resumen": "Resumen conciso de la situación en 1 o 2 oraciones.",
  "recomendaciones": "Recomendaciones de acción para el hospital o el gestor del seguro.",
  "riesgo": "ALTO" | "MEDIO" | "BAJO"
}

Reglas:
- Si el Estado de la Póliza es VENCIDA o SUSPENDIDA, la validación debe ser RECHAZADA.
- Si las pre-existencias son graves y la póliza es VIGENTE, puede ser REVISION.
- Evalúa el riesgo (ALTO, MEDIO, BAJO) según el estado y cobertura.
`;

function parseJSON(text: string): AnalisisIA {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as AnalisisIA;
  } catch (e) {
    return {
      validacion: 'REVISION',
      resumen: 'No se pudo generar un análisis concluyente.',
      recomendaciones: 'Revisar manualmente por un gestor.',
      riesgo: 'MEDIO'
    };
  }
}

export async function analizarPoliza(datos: DatosPoliza): Promise<AnalisisIA> {
  const prompt = promptBase
    .replace('{nombrePaciente}', datos.nombrePaciente)
    .replace('{estadoPoliza}', datos.estadoPoliza)
    .replace('{preExistencias}', datos.preExistencias || 'Ninguna registrada')
    .replace('{cobertura}', datos.cobertura)
    .replace('{hospital}', datos.hospital);

  const start = Date.now();

  if (env.GEMINI_API_KEY) {
    try {
      console.log(`[IA] Usando modelo: ${env.GEMINI_MODEL}`);
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log(`[IA] Análisis completado en ${Date.now() - start}ms`);
      return parseJSON(text);
    } catch (error) {
      console.error(`[IA] Error con Gemini, intentando fallback...`, error);
    }
  }

  if (env.GROQ_API_KEY) {
    try {
      console.log(`[IA] Fallback activado → Groq (${env.GROQ_MODEL})`);
      const groq = new Groq({ apiKey: env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: env.GROQ_MODEL,
        temperature: 0.1,
      });

      const text = completion.choices[0]?.message?.content || '';
      console.log(`[IA] Análisis Groq completado en ${Date.now() - start}ms`);
      return parseJSON(text);
    } catch (error) {
      console.error(`[IA] Error con Groq fallback:`, error);
    }
  }

  return parseJSON('');
}
