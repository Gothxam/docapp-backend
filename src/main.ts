import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { setupSwagger } from './swagger/index';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // frontend URL
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  // ✅ Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads',
  });
  // ✅ Static Assets (Images & Videos)
  app.useStaticAssets(join(__dirname, '..', 'assets'), {
    prefix: '/assets',
  });

  // Simple incoming request logger for debugging
  app.use((req, res, next) => {
    try {
      console.log('INCOMING:', req.method, req.url, 'Headers:', { authorization: req.headers['authorization'] })
      const auth = req.headers['authorization'] as string | undefined
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.slice(7)
        try {
          // lazy require to avoid top-level import
          const jwt = require('jsonwebtoken')
          const secret = ((process.env.JWT_SECRET || 'secret123').toString().replace(/^"|"$/g, '')).replace(/;$/g, '')
          const verified = jwt.verify(token, secret)
          console.log('Manual JWT verify succeeded, payload:', verified)
        } catch (ve) {
          console.error('Manual JWT verify failed:', ve && ve.message ? ve.message : ve)
        }
      }
    } catch (e) {
      console.error('Error logging incoming request', e)
    }
    next()
  })
  // ✅ Swagger Setup

    setupSwagger(app);
  

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs on http://localhost:${port}/api/docs`);
}

bootstrap();
