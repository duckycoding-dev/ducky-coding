import chalk from 'chalk';

interface LoggerConfig {
  showTimestamp?: boolean;
  showLevelLabel?: boolean;
  useEnvVar?: boolean;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  // eslint-disable-next-line no-use-before-define
  private static instance: Logger;

  private logLevel: LogLevel = 'info';

  private showTimestamp: boolean;

  private showLevelLabel: boolean;

  private useEnvVar: boolean;

  private constructor(config: LoggerConfig = {}) {
    this.showTimestamp = config.showTimestamp ?? true;
    this.showLevelLabel = config.showLevelLabel ?? true;
    this.useEnvVar = config.useEnvVar ?? false;
  }

  static getInstance(config?: LoggerConfig): Logger {
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

  private levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  private shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.logLevel);
  }

  static getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldShowTimestamp(): boolean {
    if (this.useEnvVar) {
      return process.env.LOGGER_SHOW_TIMESTAMP === 'true';
    }
    return this.showTimestamp;
  }

  private shouldShowLevelLabel(): boolean {
    if (this.useEnvVar) {
      return process.env.LOGGER_SHOW_LEVEL_LABEL === 'true';
    }
    return this.showLevelLabel;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    let coloredLevel: string;
    const logParts: unknown[] = [];

    // if (this.shouldShowTimestamp()) {
    //   logParts.push(`[${Logger.getTimestamp()}]`);
    // }

    // if (this.shouldShowLevelLabel()) {
    //   switch (level) {
    //     case 'warn':
    //       coloredLevel = chalk.yellow(level.toUpperCase());
    //       break;
    //     case 'error':
    //       coloredLevel = chalk.red(level.toUpperCase());
    //       break;
    //     case 'debug':
    //       coloredLevel = chalk.green(level.toUpperCase());
    //       break;
    //     case 'info':
    //     default:
    //       coloredLevel = chalk.blue(level.toUpperCase());
    //       break;
    //   }

    //   logParts.push(`${coloredLevel}:`);
    // }

    let coloredMessage = message;

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

export const createLogger = (config?: LoggerConfig) =>
  Logger.getInstance(config);
