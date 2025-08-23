import compression from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./api/app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: new ConsoleLogger({
        prefix: "NestTemplate",
        colors: true,
        logLevels: ["debug", "log", "warn", "error", "verbose"],
        timestamp: true,
        // json: true,
      }),
    },
  );

  //@ts-ignore
  await app.register(compression, { encodings: ["gzip", "deflate"] });

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  //@ts-ignore
  app.register(fastifyHelmet);

  const config = new DocumentBuilder()
    .setTitle("News API")
    .setDescription("API Documentation for news.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/swagger", app, document);

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
