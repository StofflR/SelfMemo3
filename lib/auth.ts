import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { UserService } from "../services/UserService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: process.env.AUTH_TRUST_HOST === "true" ? true : false,
  providers: [
    Credentials({
      credentials: {
        emailOrUsername: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) return null;

        const emailOrUsername = credentials.emailOrUsername as string;
        const password = credentials.password as string;

        const userService = UserService.getInstance();
        const user = emailOrUsername.includes('@')
          ? await userService.getUserByEmail(emailOrUsername)
          : await userService.getUserByUsername(emailOrUsername);

        if (user && (await bcrypt.compare(password, user.password))) {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = (token.role as string) ?? "user";
        session.user.id = (token.id as string) ?? "";
      }
      return session;
    }
  }
});