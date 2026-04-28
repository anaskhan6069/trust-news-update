import NextAuth, { type NextAuthConfig, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { findUserByEmail, upsertGoogleUser } from "@/lib/google-sheets";
import type { UserRole } from "@/types";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  adminLogin: z.string().optional()
});

type MutableAuthUser = User & {
  id: string;
  role?: UserRole;
};

type AppToken = {
  id?: unknown;
  role?: unknown;
  email?: string | null;
};

export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "trust-news-development-secret" : undefined),
  pages: {
    signIn: "/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        adminLogin: { label: "Admin Login", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password, adminLogin } = parsed.data;

        if (adminLogin === "true") {
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (adminEmail && adminPassword && email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
            return {
              id: "admin",
              name: "Trust News Admin",
              email,
              role: "admin"
            };
          }

          return null;
        }

        const user = await findUserByEmail(email);

        if (!user || user.provider !== "credentials" || !user.hashedPassword) {
          return null;
        }

        const validPassword = await compare(password, user.hashedPassword);

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        const savedUser = await upsertGoogleUser({
          name: user.name ?? user.email.split("@")[0] ?? "Trust News User",
          email: user.email
        });
        const mutableUser = user as MutableAuthUser;
        mutableUser.id = savedUser.id;
        mutableUser.role = savedUser.role;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as MutableAuthUser;
        token.id = authUser.id;
        token.role = authUser.role ?? "user";
      }

      if ((!token.id || !token.role) && token.email) {
        const savedUser = await findUserByEmail(token.email);

        if (savedUser) {
          token.id = savedUser.id;
          token.role = savedUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const appToken = token as AppToken;
        session.user.id = typeof appToken.id === "string" ? appToken.id : "";
        session.user.role = appToken.role === "admin" ? "admin" : "user";
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
