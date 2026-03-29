import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all routes except: _next, _vercel, and files with extensions (images, etc)
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
