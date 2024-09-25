type LOG_LEVEL = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'TRACE' | 'FATAL';

const empty = () => {};

const wrapper = {
  INFO: console?.info || empty,
  DEBUG: console?.debug || empty,
  WARN: console?.warn || empty,
  ERROR: console?.error || empty,
  TRACE: console?.trace || empty,
  FATAL: console?.error || empty,
};

const LEVEL_PRIORITY: { [k: string]: number } = {
  TRACE: 1,
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
};

const baseLevel =
  LEVEL_PRIORITY[process.env.CUSTOM_LAMBDA_LOGGER_LEVEL || 'WARN'];

const log = (level: LOG_LEVEL, ...args: any[]) => {
  const loggerLevel = LEVEL_PRIORITY[level];
  if (loggerLevel < baseLevel) return;

  const fun = wrapper[level];
  fun(...args);
};

// exports
const trace = (...args: any[]) => log?.('TRACE', ...args);
const debug = (...args: any[]) => log?.('DEBUG', ...args);
const info = (...args: any[]) => log?.('INFO', ...args);
const warn = (...args: any[]) => log?.('WARN', ...args);
const error = (...args: any[]) => log?.('ERROR', ...args);
const fatal = (...args: any[]) => log?.('FATAL', ...args);

export const Logger = {
  log: info,
  fatal,
  error,
  warn,
  info,
  debug,
  trace,
};
