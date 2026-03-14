import { logger } from "@utils/logger";

/**
 * Environment variable configuration with validation
 *
 * This module loads and validates all required environment variables on startup.
 * If any required variable is missing, it will throw an error before the app starts.
 */

/**
 * Validated environment configuration
 */
export interface EnvConfig {
  frappe: {
    url: string;
    apiKey: string;
    apiSecret: string;
  };
  server: {
    port: number;
    host: string;
    env: string;
  };
  logging: {
    level: string;
  };
  cors: {
    origin: string;
  };
}

/**
 * Validate that a required environment variable is set
 * @param varName Name of the environment variable
 * @param value Value of the environment variable
 * @throws Error if variable is missing or empty
 */
const validateRequired = (
  varName: string,
  value: string | undefined,
): string => {
  if (!value || value.trim() === "") {
    const errorMessage = `Missing required environment variable: ${varName}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  return value;
};

/**
 * Validate port number
 * @param portStr Port as string
 * @throws Error if port is invalid
 */
const validatePort = (portStr: string): number => {
  const port = parseInt(portStr, 10);

  if (Number.isNaN(port) || port < 1 || port > 65535) {
    const errorMessage = `Invalid PORT value: ${portStr}. Must be a number between 1 and 65535`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return port;
};

/**
 * Validate Frappe URL format
 * @param url Frappe URL to validate
 * @throws Error if URL is invalid
 */
const validateFrappeUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    const errorMessage = `Invalid FRAPPE_URL: ${url}. Must be a valid URL`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Load and validate all environment variables
 * @returns Validated environment configuration
 * @throws Error if any required variable is missing or invalid
 */
export const loadEnv = (): EnvConfig => {
  logger.info("Loading and validating environment variables...");

  try {
    // Validate required variables
    const frappeUrl = validateRequired("FRAPPE_URL", process.env.FRAPPE_URL);
    const frappeApiKey = validateRequired(
      "FRAPPE_API_KEY",
      process.env.FRAPPE_API_KEY,
    );
    const frappeApiSecret = validateRequired(
      "FRAPPE_API_SECRET",
      process.env.FRAPPE_API_SECRET,
    );
    const portStr = validateRequired("PORT", process.env.PORT);

    // Validate port number
    const port = validatePort(portStr);

    // Validate Frappe URL format
    validateFrappeUrl(frappeUrl);

    // Setup optional variables with defaults
    const nodeEnv = process.env.NODE_ENV || "development";
    const logLevel = process.env.LOG_LEVEL || "info";
    const corsOrigin = process.env.CORS_ORIGIN || "*";
    const host = process.env.HOST || "localhost";

    // Validate log level
    const validLogLevels = ["debug", "info", "warn", "error"];
    if (!validLogLevels.includes(logLevel)) {
      logger.warn(
        `LOG_LEVEL must be one of: ${validLogLevels.join(", ")}. Using 'info'`,
      );
    }

    // Validate environment
    const validEnvs = ["development", "production", "staging", "test"];
    if (!validEnvs.includes(nodeEnv)) {
      logger.warn(
        `NODE_ENV should be one of: ${validEnvs.join(", ")}. Using: ${nodeEnv}`,
      );
    }

    // Construct the configuration object
    const config: EnvConfig = {
      frappe: {
        url: frappeUrl,
        apiKey: frappeApiKey,
        apiSecret: frappeApiSecret,
      },
      server: {
        port,
        host,
        env: nodeEnv,
      },
      logging: {
        level: logLevel,
      },
      cors: {
        origin: corsOrigin,
      },
    };

    logger.info("Environment variables validated successfully", {
      nodeEnv,
      port,
      host,
      logLevel,
      frappeUrl,
    });

    return config;
  } catch (error) {
    logger.error("Failed to load environment variables", error);
    throw error;
  }
};

/**
 * Singleton instance of validated environment configuration
 * This is loaded once when the module is imported
 */
let envConfig: EnvConfig | null = null;

/**
 * Get the validated environment configuration
 * @returns Validated environment configuration
 */
export const getEnv = (): EnvConfig => {
  if (!envConfig) {
    envConfig = loadEnv();
  }
  return envConfig;
};

/**
 * Export the configuration as a singleton
 * This ensures validation happens once on first import
 */
export const env = getEnv();

export default env;
