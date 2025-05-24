/* eslint-disable max-classes-per-file */
import chalk from 'chalk';

export const LogLevelSchema = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
] as const;

export type LogLevel = (typeof LogLevelSchema)[number];

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
  log(...args: Parameters<typeof console.log>): void;
  info(...args: Parameters<typeof console.info>): void;
  warn(...args: Parameters<typeof console.warn>): void;
  error(...args: Parameters<typeof console.error>): void;
  debug(...args: Parameters<typeof console.debug>): void;
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

  protected levels: LogLevel[] = ['debug', 'log', 'info', 'warn', 'error'];

  protected shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.logLevel);
  }

  protected static getTimestamp(): string {
    return new Date().toISOString();
  }

  protected logLogic(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
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
        case 'log':
        default:
          coloredLevel = chalk.blue(level.toUpperCase());
          break;
      }

      logParts.push(`${coloredLevel}:`);
    }

    // eslint-disable-next-line no-console
    console[level](logParts.join(' '), message, ...args);
  }

  public log(...args: Parameters<typeof console.log>): void {
    this.logLogic('log', ...args);
  }

  public info(...args: Parameters<typeof console.info>): void {
    this.logLogic('info', ...args);
  }

  public warn(...args: Parameters<typeof console.warn>): void {
    this.logLogic('warn', ...args);
  }

  public error(...args: Parameters<typeof console.error>): void {
    this.logLogic('error', ...args);
  }

  public debug(...args: Parameters<typeof console.debug>): void {
    this.logLogic('debug', ...args);
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

  protected override logLogic(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
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
        case 'log':
        default:
          coloredMessage = chalk.blue(message);
          break;
      }
    }

    // eslint-disable-next-line no-console
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
