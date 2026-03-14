import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { logger } from "@utils/logger";
import { env } from "@config/env";

/**
 * Generic response wrapper for API responses
 */
export interface FrappeResponse<T = unknown> {
  message?: string;
  messages?: unknown[];
  data?: T;
  exc?: string;
  [key: string]: unknown;
}

/**
 * Request options for Frappe API calls
 */
export interface RequestOptions extends AxiosRequestConfig {
  isFullResponse?: boolean;
}

/**
 * Frappe API Client
 *
 * Provides a reusable HTTP client for interacting with Frappe APIs.
 * Handles authentication via API key headers and provides generic CRUD methods.
 *
 * Configuration is loaded from environment variables:
 * - FRAPPE_URL: Base URL of the Frappe instance
 * - FRAPPE_API_KEY: API key for authentication
 * - FRAPPE_API_SECRET: API secret for authentication
 */
export class FrappeClient {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(baseUrl?: string, apiKey?: string, apiSecret?: string) {
    this.baseUrl = baseUrl || env.frappe.url;
    this.apiKey = apiKey || env.frappe.apiKey;
    this.apiSecret = apiSecret || env.frappe.apiSecret;

    logger.info("FrappeClient initialized", { baseUrl: this.baseUrl });

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: this.getAuthHeaders(),
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      response => {
        logger.debug(
          `Frappe API response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        );
        return response;
      },
      (error: Record<string, unknown>) => {
        logger.error("Frappe API error", {
          status: (error.response as Record<string, unknown>)?.status,
          message: error.message,
          url: (error.config as Record<string, unknown>)?.url,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get authentication headers for Frappe API
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `token ${this.apiKey}:${this.apiSecret}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // Suppress Node.js v19+ automatic "Expect: 100-continue" on POST/PUT.
      // Frappe's nginx proxy returns 417 if it receives that header.
      Expect: "",
    };
  }

  /**
   * GET request - Retrieve data from Frappe
   * @param endpoint API endpoint (e.g., '/api/resource/DocType')
   * @param params Query parameters
   * @param options Additional axios request options
   * @returns Response data
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const response = await this.client.get<FrappeResponse<T>>(endpoint, {
        params,
        ...options,
      });

      return options?.isFullResponse ?
          (response as unknown as T)
        : response.data?.data || (response.data as T);
    } catch (error) {
      logger.error(`GET ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * POST request - Create or update data in Frappe
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional axios request options
   * @returns Response data
   */
  async post<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const response = await this.client.post<FrappeResponse<T>>(
        endpoint,
        data,
        options,
      );

      return options?.isFullResponse ?
          (response as unknown as T)
        : response.data?.data || (response.data as T);
    } catch (error) {
      logger.error(`POST ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * PUT request - Update data in Frappe
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional axios request options
   * @returns Response data
   */
  async put<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const response = await this.client.put<FrappeResponse<T>>(
        endpoint,
        data,
        options,
      );

      return options?.isFullResponse ?
          (response as unknown as T)
        : response.data?.data || (response.data as T);
    } catch (error) {
      logger.error(`PUT ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * DELETE request - Remove data from Frappe
   * @param endpoint API endpoint
   * @param options Additional axios request options
   * @returns Response data
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const response = await this.client.delete<FrappeResponse<T>>(
        endpoint,
        options,
      );

      return options?.isFullResponse ?
          (response as unknown as T)
        : response.data?.data || (response.data as T);
    } catch (error) {
      logger.error(`DELETE ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * PATCH request - Partial update in Frappe
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional axios request options
   * @returns Response data
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const response = await this.client.patch<FrappeResponse<T>>(
        endpoint,
        data,
        options,
      );

      return options?.isFullResponse ?
          (response as unknown as T)
        : response.data?.data || (response.data as T);
    } catch (error) {
      logger.error(`PATCH ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Health check for Frappe instance
   * @returns True if Frappe instance is reachable and authenticated
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/health");
      return response.status === 200;
    } catch (error) {
      logger.warn("Frappe health check failed", error);
      return false;
    }
  }
}

/**
 * Create and export a singleton Frappe client instance
 */
export const frappeClient = new FrappeClient();

export default frappeClient;
