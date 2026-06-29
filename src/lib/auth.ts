import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import SteamProvider from "next-auth-steam";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // Conditionally add Google Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Conditionally add Facebook Provider
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),

    // Conditionally add Azure AD Provider
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
          }),
        ]
      : []),

    // Conditionally add Steam Provider
    ...(process.env.STEAM_SECRET
      ? [
          SteamProvider({ headers: { host: process.env.NEXTAUTH_URL?.replace('https://', '')?.replace('http://', '') || 'localhost:3000' } } as any, {
            clientSecret: process.env.STEAM_SECRET,
            callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/steam`
          }),
        ]
      : []),

    CredentialsProvider({
      name: "Admin Login (Breaking Glass)",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, hash checking (bcrypt) should be done here against the DB.
        // For the "breaking glass" admin, we use a strong env-configured password.
        const adminUser = process.env.ADMIN_USERNAME || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || "supersecret";
        
        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          // Upsert the admin user into the database so foreign key relations work
          const user = await prisma.user.upsert({
            where: { email: "admin@localhost" },
            update: { role: "ADMIN" },
            create: {
              id: "admin-id",
              name: "System Admin",
              email: "admin@localhost",
              role: "ADMIN",
            }
          });

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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
