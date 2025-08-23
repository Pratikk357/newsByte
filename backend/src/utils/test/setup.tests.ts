import { Logger } from "@nestjs/common";

jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
jest.spyOn(Logger.prototype, "debug").mockImplementation(() => {});

jest.mock("@/utils/error/handler", () => ({
  handleError: jest.fn((error) => {
    throw error;
  }),
}));
