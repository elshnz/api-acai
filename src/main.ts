import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefijo global
  app.setGlobalPrefix("api/rest/v1");

  // Archivos estáticos (para servir documentos y grabaciones)
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    },
  });

  // CORS
  app.enableCors({
    origin: ["http://localhost:4200", "http://localhost:4000", "https://acai.gob.mx", "https://dev.acai.gob.mx"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("ACAI API")
    .setDescription("API de la Agencia de Conectividad y Acceso a Internet del Estado de Jalisco")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 9091;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 ACAI API running on: http://0.0.0.0:${port}`);
  console.log(`📚 Swagger docs: http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
