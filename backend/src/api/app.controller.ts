import { Controller, Get } from "@nestjs/common";
import { AppService } from "@/api/app.service";
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { Public } from "@/common/decorators";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Public()
  // @MessagePattern("scraper.results")
  // handleAll(@Payload() data: any, @Ctx() context: RmqContext) {
  //   const msg = context.getMessage();
  //   const routingKey = msg.fields.routingKey || 'undefined';
  //   console.log('Received message with pattern:', routingKey);
  //   console.log('Payload:', data);
  //   context.getChannelRef().ack(msg);
  // }

  @Public()
  @EventPattern("scraper.results")
  async handleScrapedData(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log("Received data:", data, "receieved here btw");
  }
}
