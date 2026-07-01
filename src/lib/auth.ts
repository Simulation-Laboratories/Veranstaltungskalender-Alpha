import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import SteamProvider from "authjs-steam-provider";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { getSystemSetting } from "./config";

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  const googleConfig = await getSystemSetting('auth_google', { clientId: '', clientSecret: '' });
  const facebookConfig = await getSystemSetting('auth_facebook', { clientId: '', clientSecret: '' });
  const azureConfig = await getSystemSetting('auth_azure', { clientId: '', clientSecret: '', tenantId: '' });
  const steamConfig = await getSystemSetting('auth_steam', { clientSecret: '' });
  
  const adminCreds = await getSystemSetting('admin_credentials', { adminUsername: 'admin', adminPassword: 'supersecret_change_me' });
  const nextAuthUrl = await getSystemSetting('nextauth_url', 'http://localhost:3000');

  let jwtSecret = await getSystemSetting('jwt_secret', '');
  if (!jwtSecret) {
    jwtSecret = crypto.randomUUID() + crypto.randomUUID();
    await prisma.systemSettings.upsert({
      where: { key: 'jwt_secret' },
      update: {},
      create: { key: 'jwt_secret', value: JSON.stringify(jwtSecret) }
    });
  }

  return {
    secret: jwtSecret,
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: "jwt",
    },
    providers: [
      ...(googleConfig.clientId && googleConfig.clientSecret
        ? [
            GoogleProvider({
              clientId: googleConfig.clientId,
              clientSecret: googleConfig.clientSecret,
            }),
          ]
        : []),

      ...(facebookConfig.clientId && facebookConfig.clientSecret
        ? [
            FacebookProvider({
              clientId: facebookConfig.clientId,
              clientSecret: facebookConfig.clientSecret,
            }),
          ]
        : []),

      ...(azureConfig.clientId && azureConfig.clientSecret && azureConfig.tenantId
        ? [
            AzureADProvider({
              clientId: azureConfig.clientId,
              clientSecret: azureConfig.clientSecret,
              issuer: `https://login.microsoftonline.com/${azureConfig.tenantId}/v2.0`,
            }),
          ]
        : []),

      ...(steamConfig.clientSecret
        ? [
            SteamProvider(req ?? new Request(nextAuthUrl), {
              clientSecret: steamConfig.clientSecret,
              callbackUrl: `${nextAuthUrl}/api/auth/callback`
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
          if (
            credentials?.username === adminCreds.adminUsername &&
            credentials?.password === adminCreds.adminPassword
          ) {
            const user = await prisma.user.upsert({
              where: { email: `${adminCreds.adminUsername}@localhost` },
              update: { role: "ADMIN" },
              create: {
                id: "admin-id",
                name: "System Admin",
                email: `${adminCreds.adminUsername}@localhost`,
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
          token.role = user.role;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role as string | undefined;
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  };
});
