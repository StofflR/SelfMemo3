import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config"; // <--- Nur Config importieren!

export default NextAuth(authConfig).auth;

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
