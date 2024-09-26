import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  showTimestamp: boolean;
  showLevelLabel: boolean;
  showColoredOutput: boolean;
  logLevel: LogLevel;
}

class Logger {
  // eslint-disable-next-line no-use-before-define
  private static instance: Logger;

  private logLevel: LogLevel;

  private showTimestamp: boolean;

  private showLevelLabel: boolean;

  private showColoredOutput: boolean;

  private constructor(config: LoggerConfig) {
    this.showTimestamp = config.showTimestamp;
    this.showLevelLabel = config.showLevelLabel;
    this.showColoredOutput = config.showColoredOutput;
    this.logLevel = config.logLevel;
  }

  static getInstance(config: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setShowTimestamp(show: boolean): void {
    this.showTimestamp = show;
  }

  setShowLevelLabel(show: boolean): void {
    this.showTimestamp = show;
  }

  setShowColoredOutput(show: boolean): void {
    this.showColoredOutput = show;
  }

  private levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  private shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.logLevel);
  }

  static getTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    let coloredLevel: string;
    const logParts: unknown[] = [];

    if (this.showTimestamp) {
      logParts.push(`[${Logger.getTimestamp()}]`);
    }

    if (this.showLevelLabel) {
      switch (level) {
        case 'warn':
          coloredLevel = chalk.yellow(level.toUpperCase());
          break;
        case 'error':
          coloredLevel = chalk.red(level.toUpperCase());
          break;
        case 'debug':
          coloredLevel = chalk.green(level.toUpperCase());
          break;
        case 'info':
        default:
          coloredLevel = chalk.blue(level.toUpperCase());
          break;
      }

      logParts.push(`${coloredLevel}:`);
    }

    let coloredMessage = message;

    if (this.showColoredOutput) {
      switch (level) {
        case 'warn':
          coloredMessage = chalk.yellow(message);
          break;
        case 'error':
          coloredMessage = chalk.red(message);
          break;
        case 'debug':
          coloredMessage = chalk.green(message);
          break;
        case 'info':
        default:
          coloredMessage = chalk.blue(message);
          break;
      }
    }

    console[level](logParts.join(' '), coloredMessage, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }
}

/**
 * Create a logger instance with the given configuration.
 *
 * @param {Partial<LoggerConfig>} [config={}] - The partial configuration for the logger.
 * @returns {Logger} The logger instance.
 */
export const createLogger = (
  config: Partial<LoggerConfig> = {
    logLevel: 'info',
    showColoredOutput: false,
    showLevelLabel: true,
    showTimestamp: true,
  },
) => {
  const actualConfig: LoggerConfig = {
    logLevel: config.logLevel ?? 'info',
    showTimestamp: config.showTimestamp ?? true,
    showLevelLabel: config.showLevelLabel ?? true,
    showColoredOutput: config.showColoredOutput ?? false,
  };

  return Logger.getInstance(actualConfig);
};
