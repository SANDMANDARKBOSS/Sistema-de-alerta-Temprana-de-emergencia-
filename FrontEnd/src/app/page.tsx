'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import anime from 'animejs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import medixLogo from '../Assets/LOGO MEDIX.jpeg';

// Spline se carga de forma lazy con placeholder para no bloquear el paint inicial
const Spline = dynamic(
  () => import('../components/spline/SplineRuntime').then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#111B32_50%,#0a1628_100%)]" />
    ),
  }
);

const architectureRows = [
  ['Entrada hospitalaria', 'Webhook con cedula, hospital y motivo de ingreso.'],
  ['Validacion automatizada', 'Cruce de vigencia, cobertura y preexistencias del asegurado.'],
  ['Dictamen asistido', 'Gemini y Groq emiten resumen, riesgo y recomendacion operativa.'],
  ['Accion simultanea', 'Hospital, gestor y paciente reciben respuesta sin esperas.'],
];

const resourceRows = [
  ['Gemini', 'Analisis principal del caso y generacion de criterio preliminar.'],
  ['Groq', 'Respaldo para asegurar continuidad del dictamen automatizado.'],
  ['Notion', 'Persistencia de polizas, asegurados, alertas y trazabilidad del caso.'],
  ['Socket.IO', 'Actualizacion en vivo de paneles y eventos del sistema.'],
  ['Nodemailer', 'Notificaciones sincronas a las areas involucradas.'],
];

const operationalNotes = [
  'Diseñado con la logica de plataformas hospitalarias clasicas: jerarquia clara, confirmacion y trazabilidad.',
  'Interfaz pensada para reducir friccion en admisiones y equipos de seguro durante una emergencia.',
  'Composicion full-screen con foco en lectura, decision y continuidad operativa.',
];

export default function HomePage() {
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [splineReady, setSplineReady] = useState(false);

  // Defer Spline load until after page is interactive (paint first, 3D after)
  useEffect(() => {
    const load = () => setSplineReady(true);
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(load, { timeout: 2000 });
    } else {
      setTimeout(load, 300);
    }
  }, []);

  useEffect(() => {
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 900,
    });

    timeline
      .add({
        targets: '.medix-hero-line',
        translateY: [28, 0],
        opacity: [0, 1],
        delay: anime.stagger(110),
      })
      .add(
        {
          targets: '.medix-hero-rule',
          scaleX: [0, 1],
          opacity: [0, 1],
          duration: 800,
        },
        '-=500'
      )
      .add(
        {
          targets: '.medix-hero-copy, .medix-hero-actions, .medix-hero-ledger, .medix-stage-shell, .medix-band',
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(80),
        },
        '-=520'
      );

    anime({
      targets: '.medix-stage-glow',
      scale: [0.96, 1.05],
      opacity: [0.28, 0.5],
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
      duration: 3800,
    });

    anime({
      targets: '.medix-stage-orbit',
      translateY: [-6, 6],
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
      duration: 4200,
    });

    return () => {
      anime.remove('.medix-hero-line');
      anime.remove('.medix-hero-rule');
      anime.remove('.medix-hero-copy');
      anime.remove('.medix-hero-actions');
      anime.remove('.medix-hero-ledger');
      anime.remove('.medix-stage-shell');
      anime.remove('.medix-band');
      anime.remove('.medix-stage-glow');
      anime.remove('.medix-stage-orbit');
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-dark">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.94]">
        {splineReady ? (
          <Spline
            scene="https://prod.spline.design/TLMVYjxwqj3COq2M/scene.splinecode"
            style={{ filter: 'brightness(1.08) saturate(1.08)' }}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#111B32_50%,#0a1628_100%)]" />
        )}
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.10),transparent_20%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.90)_0%,rgba(248,250,252,0.72)_44%,rgba(248,250,252,0.90)_100%)]" />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.35),transparent)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-white/92 backdrop-blur-md">
          <div className="flex w-full items-center justify-between gap-6 px-4 py-4 md:px-8 xl:px-10">
            <Link href="/" className="flex items-center gap-4">
              <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <Image src={medixLogo} alt="Logo Medix" className="h-14 w-14 object-cover" priority />
              </div>
              <div>
                <p className="text-[22px] font-bold tracking-[-0.04em] text-dark">Medix</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-grayText">
                  Alertas que salvan vidas
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-10 text-[13px] font-semibold uppercase tracking-[0.16em] text-grayText lg:flex">
              <a href="#arquitectura" className="transition hover:text-primary">
                Arquitectura
              </a>
              <a href="#recursos" className="transition hover:text-primary">
                Recursos
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCaseModalOpen(true)}
                className="hidden rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary md:inline-flex"
              >
                Ver caso
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#2DD4BF_0%,#22D3EE_45%,#2563EB_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition hover:translate-y-[-1px]"
              >
                Acceder al sistema
              </Link>
            </div>
          </div>
        </header>

        <main className="w-full px-4 pb-10 md:px-8 md:pb-12 xl:px-10">
          <section className="grid min-h-[calc(100vh-88px)] items-stretch gap-6 py-6 xl:grid-cols-[1fr_1fr] xl:py-8">
            <div className="flex min-h-full flex-col justify-between rounded-[34px] border border-border bg-white/92 p-7 shadow-[0_26px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-9 xl:p-12">
              <div>
                <p className="medix-hero-line text-[12px] font-semibold uppercase tracking-[0.24em] text-primary opacity-0">
                  Sistema de alerta temprana de emergencias
                </p>

                <div className="mt-6 space-y-2">
                  <p className="medix-hero-line text-[clamp(3rem,7vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.08em] text-dark opacity-0">
                    Respuesta inmediata.
                  </p>
                  <p className="medix-hero-line text-[clamp(3rem,7vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.08em] text-dark opacity-0">
                    Cobertura validada.
                  </p>
                  <p className="medix-hero-line text-[clamp(3rem,7vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.08em] text-transparent opacity-0 bg-[linear-gradient(135deg,#2DD4BF_0%,#22D3EE_45%,#2563EB_100%)] bg-clip-text">
                    Decisiones con contexto.
                  </p>
                </div>

                <div className="medix-hero-rule mt-7 h-px origin-left bg-[linear-gradient(90deg,#2DD4BF_0%,#2563EB_100%)] opacity-0" />

                <p className="medix-hero-copy mt-7 max-w-[38rem] text-lg leading-8 text-grayText opacity-0">
                  Medix traduce un ingreso de emergencia en una secuencia clara de validacion,
                  analisis y aviso operativo. El objetivo no es decorar un panel, sino ayudar a
                  que hospital y seguro reaccionen con criterio en el menor tiempo posible.
                </p>

                <div className="medix-hero-actions mt-9 flex flex-col gap-3 sm:flex-row sm:items-center opacity-0">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16233B]"
                  >
                    Entrar al panel
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsCaseModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
                  >
                    Resumen del caso
                  </button>
                </div>
              </div>

              <div className="medix-hero-ledger mt-12 border-t border-border pt-6 opacity-0">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Motor operativo
                    </p>
                    <p className="mt-3 text-base leading-7 text-dark">
                      Validacion automatizada de poliza y preexistencias antes de escalar el caso.
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Prioridad del sistema
                    </p>
                    <p className="mt-3 text-base leading-7 text-dark">
                      Reducir el tiempo de espera entre el ingreso clinico y la respuesta administrativa.
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Trazabilidad
                    </p>
                    <p className="mt-3 text-base leading-7 text-dark">
                      Registro persistente del evento, su dictamen y las notificaciones emitidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="medix-stage-shell relative min-h-[620px] overflow-hidden rounded-[34px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,250,252,0.80)_100%)] shadow-[0_26px_70px_rgba(15,23,42,0.08)] opacity-0">
              <div className="medix-stage-glow absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.20)_0%,rgba(37,99,235,0.08)_45%,transparent_72%)]" />

              <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(248,250,252,0.08)_0%,rgba(248,250,252,0)_24%,rgba(248,250,252,0)_72%,rgba(248,250,252,0.46)_100%)]" />

              <div className="absolute left-0 top-0 z-20 w-full border-b border-border/80 bg-white/82 px-6 py-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Plataforma Medix
                    </p>
                    <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.8rem)] font-bold tracking-[-0.05em] text-dark">
                      Coordinacion clinica y administrativa en tiempo real
                    </h2>
                  </div>
                  <div className="hidden min-w-[13rem] border-l border-border pl-6 lg:block">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-grayText">
                      Proposito
                    </p>
                    <p className="mt-2 text-base leading-7 text-dark">
                      Unificar validacion, criterio y notificacion en un solo flujo operativo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="medix-stage-orbit absolute inset-x-0 bottom-[112px] top-[108px] flex items-center justify-center px-8">
                <div className="grid w-full max-w-3xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative flex justify-center lg:justify-start">
                    <div className="absolute h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22)_0%,rgba(37,99,235,0.10)_52%,transparent_74%)] blur-2xl" />
                    <div className="relative overflow-hidden rounded-[34px] border border-border bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
                      <Image
                        src={medixLogo}
                        alt="Logo Medix"
                        className="h-[290px] w-[290px] object-cover md:h-[340px] md:w-[340px]"
                        priority
                      />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-border bg-white/88 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Nucleo del sistema
                    </p>
                    <h3 className="mt-3 text-[clamp(1.6rem,2.3vw,2.3rem)] font-bold tracking-[-0.05em] text-dark">
                      Alertas que salvan vidas
                    </h3>
                    <p className="mt-4 text-base leading-8 text-grayText">
                      Medix recibe el ingreso, valida la poliza, consulta antecedentes y entrega
                      una respuesta coordinada para que hospital y seguro actuen sin fricciones.
                    </p>

                    <div className="mt-6 space-y-4 border-t border-border pt-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-grayText">
                          Entrada
                        </p>
                        <p className="mt-1 text-sm leading-7 text-dark">
                          Evento de emergencia con cedula, hospital y motivo de ingreso.
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-grayText">
                          Resultado
                        </p>
                        <p className="mt-1 text-sm leading-7 text-dark">
                          Decision operativa con trazabilidad y notificacion paralela.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 z-20 w-full border-t border-border/80 bg-white/84 px-6 py-5 backdrop-blur-sm">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Riesgo detectado
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-dark">1,248</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Tiempo de respuesta
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-dark">2.4 min</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                      Eficiencia operativa
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-dark">82%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article
              id="arquitectura"
              className="medix-band rounded-[30px] border border-border bg-white/92 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] opacity-0 md:p-8"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
                Arquitectura de operacion
              </p>
              <h3 className="mt-3 text-[clamp(2rem,3vw,2.8rem)] font-bold tracking-[-0.05em] text-dark">
                Estructura pensada para control, no para ruido visual
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-8 text-grayText">
                Antes de la ola de interfaces genericas de IA, los sistemas empresariales solian priorizar
                lectura rapida, consistencia y responsabilidad operativa. Ese criterio guia esta portada:
                menos adornos, mas orden y mejor continuidad con el trabajo real del equipo.
              </p>

              <div className="mt-8 divide-y divide-border">
                {architectureRows.map(([title, copy]) => (
                  <div key={title} className="grid gap-3 py-4 md:grid-cols-[220px_1fr]">
                    <p className="text-sm font-semibold text-dark">{title}</p>
                    <p className="text-sm leading-7 text-grayText">{copy}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="medix-band rounded-[30px] border border-border bg-white/92 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] opacity-0 md:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
                Criterios de interfaz
              </p>
              <h3 className="mt-3 text-[clamp(2rem,3vw,2.8rem)] font-bold tracking-[-0.05em] text-dark">
                Una experiencia sobria, clinica y empresarial
              </h3>

              <div className="mt-8 space-y-5">
                {operationalNotes.map((note) => (
                  <div key={note} className="border-l-2 border-primary/20 pl-5">
                    <p className="text-base leading-8 text-grayText">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-grayText">
                  Sistema Medix
                </p>
                <p className="mt-3 text-base leading-8 text-dark">
                  Una misma paleta recorre el shell, el login y la portada para que el producto se sienta
                  unificado desde la entrada hasta el panel operativo.
                </p>
              </div>
            </article>
          </section>

          <section
            id="recursos"
            className="medix-band mt-6 rounded-[30px] border border-border bg-white/92 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] opacity-0 md:p-8"
          >
            <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Recursos usados
                </p>
                <h3 className="mt-3 text-[clamp(2rem,3vw,2.8rem)] font-bold tracking-[-0.05em] text-dark">
                  Tecnologias asignadas a una funcion concreta
                </h3>
              </div>

              <div className="divide-y divide-border">
                {resourceRows.map(([name, description]) => (
                  <div key={name} className="grid gap-2 py-4 md:grid-cols-[160px_1fr]">
                    <p className="text-sm font-semibold text-dark">{name}</p>
                    <p className="text-sm leading-7 text-grayText">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {isCaseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.56)] px-4 py-8"
            onClick={() => setIsCaseModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-3xl rounded-[30px] border border-border bg-white p-7 shadow-[0_26px_80px_rgba(15,23,42,0.24)] md:p-8"
            >
              <button
                type="button"
                onClick={() => setIsCaseModalOpen(false)}
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg text-grayText transition hover:border-primary hover:text-primary"
              >
                ×
              </button>

              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-primary">
                Caso de uso
              </p>
              <h3 className="mt-3 max-w-2xl text-[clamp(2rem,3vw,2.8rem)] font-bold tracking-[-0.05em] text-dark">
                Sistema de Alerta Temprana de Ingresos a Emergencias
              </h3>
              <p className="mt-5 max-w-3xl text-base leading-8 text-grayText">
                Cuando un asegurado ingresa al area de emergencia, un webhook inicia la validacion del caso.
                El sistema consulta la poliza, revisa preexistencias, solicita un dictamen automatizado y
                notifica al departamento de admisiones del hospital y al gestor de seguros de manera paralela.
              </p>

              <div className="mt-8 divide-y divide-border rounded-[24px] border border-border">
                <div className="grid gap-3 px-5 py-4 md:grid-cols-[170px_1fr]">
                  <p className="text-sm font-semibold text-dark">Entrada</p>
                  <p className="text-sm leading-7 text-grayText">
                    Cedula, hospital y motivo de ingreso llegan al backend como evento de emergencia.
                  </p>
                </div>
                <div className="grid gap-3 px-5 py-4 md:grid-cols-[170px_1fr]">
                  <p className="text-sm font-semibold text-dark">Decision</p>
                  <p className="text-sm leading-7 text-grayText">
                    La IA devuelve validacion, nivel de riesgo, resumen clinico y recomendacion operativa.
                  </p>
                </div>
                <div className="grid gap-3 px-5 py-4 md:grid-cols-[170px_1fr]">
                  <p className="text-sm font-semibold text-dark">Salida</p>
                  <p className="text-sm leading-7 text-grayText">
                    El sistema registra la alerta y distribuye la respuesta al hospital, al gestor y al paciente.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
