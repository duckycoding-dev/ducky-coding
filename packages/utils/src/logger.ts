/* eslint-disable max-classes-per-file */
import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface BaseLoggerConfig {
  showTimestamp: boolean;
  showLevelLabel: boolean;
  logLevel: LogLevel;
}

type ClientLoggerConfig = BaseLoggerConfig;

interface ServerLoggerConfig extends BaseLoggerConfig {
  showColoredOutput: boolean;
}

interface BaseLogger {
  setLogLevel(level: LogLevel): void;
  setShowTimestamp(show: boolean): void;
  setShowLevelLabel(show: boolean): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export type ClientLogger = BaseLogger;

export interface ServerLogger extends BaseLogger {
  setShowColoredOutput(show: boolean): void;
}

class LoggerImpl implements BaseLogger {
  protected logLevel: LogLevel;

  protected showTimestamp: boolean;

  protected showLevelLabel: boolean;

  constructor(config: ClientLoggerConfig) {
    this.showTimestamp = config.showTimestamp;
    this.showLevelLabel = config.showLevelLabel;
    this.logLevel = config.logLevel;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public setShowTimestamp(show: boolean): void {
    this.showTimestamp = show;
  }

  public setShowLevelLabel(show: boolean): void {
    this.showLevelLabel = show;
  }

  protected levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  protected shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.logLevel);
  }

  protected static getTimestamp(): string {
    return new Date().toISOString();
  }

  protected log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const logParts: unknown[] = [];

    if (this.showTimestamp) {
      logParts.push(`[${LoggerImpl.getTimestamp()}]`);
    }

    // for some reasons the label can be colored even in the browser, while the messages are not interpolated correctly: thus we keep only the labels colored
    if (this.showLevelLabel) {
      let coloredLevel: string;
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

    console[level](logParts.join(' '), message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }
}

/**
 * Extends the base logger to add colored output for the server environment:
 * in fact, chalk (the library underneath) does not work for the browser's console output.
 * Don't use in the client environment.
 */
class ServerImpl extends LoggerImpl implements ServerLogger {
  constructor(config: ServerLoggerConfig) {
    super(config);
    this.showColoredOutput = config.showColoredOutput;
  }

  public setShowColoredOutput(show: boolean): void {
    this.showColoredOutput = show;
  }

  private showColoredOutput: boolean;

  protected log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const logParts: unknown[] = [];

    if (this.showTimestamp) {
      logParts.push(`[${LoggerImpl.getTimestamp()}]`);
    }

    if (this.showLevelLabel) {
      let coloredLevel: string;
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
      // Only import chalk in server environment
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
}

export const createClientLogger = (
  config: Partial<ClientLoggerConfig> = {},
): ClientLogger => {
  const actualConfig: ClientLoggerConfig = {
    logLevel: config.logLevel ?? 'info',
    showTimestamp: config.showTimestamp ?? true,
    showLevelLabel: config.showLevelLabel ?? true,
  };

  const clientLogger = new LoggerImpl(actualConfig) as ClientLogger;

  return clientLogger;
};

export const createServerLogger = (
  config: Partial<ServerLoggerConfig> = {},
): ServerLogger => {
  const actualConfig: ServerLoggerConfig = {
    logLevel: config.logLevel ?? 'info',
    showTimestamp: config.showTimestamp ?? true,
    showLevelLabel: config.showLevelLabel ?? true,
    showColoredOutput: config.showColoredOutput ?? true,
  };

  const serverLogger = new ServerImpl(actualConfig) as ServerLogger;
  return serverLogger;
};
