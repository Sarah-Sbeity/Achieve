import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve frontend so login and API are same-origin (cookies work)
  // Nest compiles to dist/src/main.js, so __dirname is backend/dist/src; frontend is ../../../frontend
  const frontendPath = join(__dirname, '..', '..', '..', 'frontend');
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance() as express.Express;
  expressApp.use(express.static(frontendPath));
  // SPA fallback: serve index.html for GET requests that aren't API routes (path-to-regexp rejects '*')
  expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/auth') || req.path.startsWith('/survey') || req.path.startsWith('/users') || req.path.startsWith('/api')) return next();
    res.sendFile(join(frontendPath, 'index.html'), (err: Error | null) => { if (err) next(); });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://0.0.0.0:${port}`);
  console.log(`Frontend served from ${frontendPath}. Open http://localhost:${port}`);
}
bootstrap();
