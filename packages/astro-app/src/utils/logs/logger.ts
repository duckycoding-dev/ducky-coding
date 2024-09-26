import { createLogger } from '@ducky-coding/utils/logger';

const logger = createLogger({
  showTimestamp: true,
  showLevelLabel: true,
  showColoredOutput: true,
  logLevel: import.meta.env.CLIENT_LOGS_LEVEL ?? 'info',
});

export const clientLogger = logger;

export const serverLogger = createLogger({
  showTimestamp: true,
  showLevelLabel: true,
  showColoredOutput: true,
  logLevel: import.meta.env.SERVER_LOGS_LEVEL ?? 'warn',
});

export default logger;
