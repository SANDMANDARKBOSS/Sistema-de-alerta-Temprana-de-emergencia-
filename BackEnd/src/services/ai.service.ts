import { env } from '../config/env';

interface AIInput {
  estadoPoliza: string;
  preExistencias?: string | null;
  hospital: string;
}

export async function generarResumenIA(input: AIInput): Promise<string | null> {
  const prompt = `Analiza en máximo 2 líneas el riesgo asistencial para ingreso de urgencias. Estado póliza: ${input.estadoPoliza}. Preexistencias: ${input.preExistencias ?? 'No registradas'}. Hospital: ${input.hospital}.`;

  if (env.geminiApiKey) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          })
        }
      );

      if (resp.ok) {
        const json = (await resp.json()) as any;
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === 'string' && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {
      // fallback a groq
    }
  }

  if (env.groqApiKey) {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.groqApiKey}`
        },
        body: JSON.stringify({
          model: env.groqModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });

      if (resp.ok) {
        const json = (await resp.json()) as any;
        const text = json?.choices?.[0]?.message?.content;
        if (typeof text === 'string' && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {
      // ignora si falla IA
    }
  }

  return null;
}
