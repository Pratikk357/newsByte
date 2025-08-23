import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

export function handleError(
  error: unknown,
  contextMessage = "An error occurred",
  logger: Logger = new Logger("GenericErrorHandler"),
): never {
  logger.error(contextMessage, error);
  if (error instanceof HttpException) {
    throw error;
  }

  // For unexpected errors, throw a generic internal server error
  throw new InternalServerErrorException(contextMessage);
}
