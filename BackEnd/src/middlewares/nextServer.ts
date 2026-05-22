import path from 'path';
import express from 'express';

/**
 * Monta Next.js dentro de Express usando la librería `next` directamente.
 * Esto es exactamente lo que hace `next start` pero embebido en Express.
 *
 * En DESARROLLO: no hace nada (el frontend corre aparte con `next dev`)
 * En PRODUCCIÓN (Render): Express sirve la API en /api/* y Next.js en el resto
 */
export async function mountNextApp(app: express.Application): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Next.js] Modo desarrollo — frontend corre en puerto 3000 por separado');
    return;
  }

  // El servidor corre desde la raíz del proyecto en Render
  const frontendDir = path.join(process.cwd(), 'FrontEnd');

  // Cargar `next` desde node_modules de FrontEnd (instalado por npm install --prefix FrontEnd)
  const nextModulePath = path.join(frontendDir, 'node_modules', 'next');

  try {
    // next se carga en runtime desde FrontEnd/node_modules — no está disponible
    // en el backend en tiempo de compilación, por eso usamos require() dinámico.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextModule = require(nextModulePath) as { default?: any; [key: string]: any };
    const createNextApp = (nextModule.default ?? nextModule) as (opts: any) => any;

    const nextApp = createNextApp({
      dev: false,          // Modo producción: lee el .next/ pre-compilado
      dir: frontendDir,    // Apunta a FrontEnd/ donde está .next/
      quiet: false,
    });

    // Preparar Next.js (carga el build, inicializa el router, etc.)
    await nextApp.prepare();

    const handle = nextApp.getRequestHandler();

    // Servir archivos estáticos de Next.js directamente (más rápido que via handler)
    app.use(
      '/_next/static',
      express.static(path.join(frontendDir, '.next', 'static'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Servir archivos públicos (imágenes, logos, etc.)
    app.use(
      express.static(path.join(frontendDir, 'public'), {
        maxAge: '1h',
      })
    );

    // Todo lo que NO sea /api/* lo maneja Next.js
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api/')) {
        return next(); // Dejar pasar las rutas de la API
      }
      return handle(req, res);
    });

    console.log('[Next.js] ✅ Frontend montado en Express correctamente');
    console.log(`[Next.js]    Sirviendo desde: ${frontendDir}`);
  } catch (err: any) {
    console.error('[Next.js] ❌ Error al cargar el frontend:', err?.message ?? err);
    console.error('[Next.js]    Verifica que "npm run build" se ejecutó correctamente');
    console.error('[Next.js]    Path buscado:', nextModulePath);
  }
}
