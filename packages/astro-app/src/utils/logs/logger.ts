import { createLogger } from '@ducky-coding/utils/logger';

export const logger = createLogger({
  showTimestamp: false,
  showLevelLabel: true,
  useEnvVar: false,
});
