import { env } from "./env.js";

export const appConfig = {
  app: {
    name: process.env.APP_NAME || "AutoCRM Backend",
    version: process.env.APP_VERSION || "1.0.0",
    environment: env.server.env,
  },
  server: {
    port: env.server.port,
    host: env.server.host,
  },
  logging: {
    level: env.logging.level,
  },
  cors: {
    origin: env.cors.origin,
    credentials: true,
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  frappe: {
    apiUrl: env.frappe.url,
    apiKey: env.frappe.apiKey,
    apiSecret: env.frappe.apiSecret,
  },
};
