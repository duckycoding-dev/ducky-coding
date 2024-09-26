import {
  createClientLogger,
  createServerLogger,
  type ClientLogger,
  type ServerLogger,
} from '@ducky-coding/utils/logger';

/**
 * Holds the singleton instance of the client logger.
 */
let clientLoggerInstance: ClientLogger;

/**
 * Holds the singleton instance of the server logger.
 */
let serverLoggerInstance: ServerLogger;

/**
 * Returns the singleton instance of the client logger.
 * If the instance doesn't exist, it creates one with default configuration.
 *
 * @returns {ClientLogger} The singleton client logger instance.
 */
export const getClientLogger = (): ClientLogger => {
  if (!clientLoggerInstance) {
    clientLoggerInstance = createClientLogger({
      showTimestamp: true,
      showLevelLabel: true,
      logLevel: import.meta.env.CLIENT_LOGS_LEVEL ?? 'info',
    });
  }
  return clientLoggerInstance;
};

/**
 * Returns the singleton instance of the server logger.
 * If the instance doesn't exist, it creates one with default configuration.
 *
 * @returns {ServerLogger} The singleton server logger instance.
 */
export const getServerLogger = (): ServerLogger => {
  if (!serverLoggerInstance) {
    serverLoggerInstance = createServerLogger({
      showTimestamp: true,
      showLevelLabel: true,
      showColoredOutput: true,
      logLevel: import.meta.env.SERVER_LOGS_LEVEL ?? 'warn',
    });
  }
  return serverLoggerInstance;
};

/**
 * The singleton instance of the client logger.
 * This is created on the first import of this module.
 */
export const clientLogger: ClientLogger = getClientLogger();

/**
 * The singleton instance of the server logger.
 * This is created on the first import of this module.
 */
export const serverLogger: ServerLogger = getServerLogger();
