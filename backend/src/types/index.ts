import { Request } from "express";

export interface AppRequest extends Request {
  userId?: string;
  user?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Entity type exports
export type * from "./vehicle";
export type * from "./lead";
export type * from "./payment";
