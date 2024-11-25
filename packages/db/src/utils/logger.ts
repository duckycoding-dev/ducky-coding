import { createServerLogger } from '@ducky-coding/utils/logger';

/**
 * Holds the singleton instance of the server logger.
 */

let serverLoggerInstance: ReturnType<typeof createServerLogger>;

/**
 * Returns the singleton instance of the server logger.
 * If the instance doesn't exist, it creates one with default configuration.
 *
 * @returns {ServerLogger} The singleton server logger instance.
 */
export const getServerLogger = (): ReturnType<typeof createServerLogger> => {
  console.log('DUCKYLOG', process.env.LOGS_LEVEL);
  if (!serverLoggerInstance) {
    serverLoggerInstance = createServerLogger({
      showTimestamp: true,
      showLevelLabel: true,
      showColoredOutput: true,
      logLevel: process.env.LOGS_LEVEL ?? 'warn',
    });
  }
  return serverLoggerInstance;
};

/**
 * The singleton instance of the server logger.
export const serverLogger: ServerLogger = getServerLogger();
 */
export const logger = getServerLogger();
