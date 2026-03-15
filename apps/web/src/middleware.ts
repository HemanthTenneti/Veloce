import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all routes except: api, files (Frappe proxy), _next, _vercel, and files with extensions
  matcher: "/((?!api|files|_next|_vercel|.*\\..*).*)",
};
