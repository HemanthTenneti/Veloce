type LogLevel = "debug" | "info" | "warn" | "error";

const LogLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getLogLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    debug: "\x1b[36m", // cyan
    info: "\x1b[32m", // green
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  return colors[level];
};

const resetColor = "\x1b[0m";

class Logger {
  private currentLevel: LogLevel;

  constructor(level: LogLevel = "info") {
    this.currentLevel = (process.env.LOG_LEVEL as LogLevel) || level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LogLevelPriority[level] >= LogLevelPriority[this.currentLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    meta?: unknown,
  ): string {
    const timestamp = new Date().toISOString();
    const color = getLogLevelColor(level);
    const levelUpper = level.toUpperCase();

    if (meta) {
      const metaStr =
        typeof meta === "string" ? meta : JSON.stringify(meta, null, 2);
      return `${color}[${timestamp}] ${levelUpper}${resetColor}: ${message}\n${metaStr}`;
    }

    return `${color}[${timestamp}] ${levelUpper}${resetColor}: ${message}`;
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog("debug")) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage("debug", message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, meta));
    }
  }
}

export const logger = new Logger();
