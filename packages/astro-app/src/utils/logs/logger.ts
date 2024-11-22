import {
  createClientLogger,
  createServerLogger,
} from '@ducky-coding/utils/logger';

/**
 * Holds the singleton instance of the client logger.
 */
let clientLoggerInstance: ReturnType<typeof createClientLogger>;

/**
 * Holds the singleton instance of the server logger.
 */
let serverLoggerInstance: ReturnType<typeof createServerLogger>;

/**
 * Returns the singleton instance of the client logger.
 * If the instance doesn't exist, it creates one with default configuration.
 *
 * @returns {ClientLogger} The singleton client logger instance.
 */
export const getClientLogger = (): ReturnType<typeof createClientLogger> => {
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
export const getServerLogger = (): ReturnType<typeof createServerLogger> => {
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
export const clientLogger = getClientLogger();

/**
 * The singleton instance of the server logger.
 * This is created on the first import of this module.
 */
export const serverLogger = getServerLogger();
