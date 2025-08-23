// rabbitmq-consumer.ts
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./api/app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://guest:guest@localhost:5672"],
        queue: "scraped_data_queue",
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log("✅ RabbitMQ Microservice is listening");
}
bootstrap();
