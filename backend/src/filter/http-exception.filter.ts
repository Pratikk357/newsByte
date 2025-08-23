import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { RpcException as RpcEx } from "@nestjs/microservices";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const contextType = host.getType();

    const status = exception.getStatus();
    const message =
      exception.getResponse() instanceof Object
        ? (exception.getResponse() as any).message
        : exception.message;

    if (contextType === "http") {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      response.status(status).send({
        status: false,
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (contextType === "rpc") {
      // For RabbitMQ or other microservice transports, throw RpcException
      throw new RpcEx({
        status: false,
        statusCode: status,
        message,
      });
    }
  }
}
