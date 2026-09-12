import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/client";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Ensure user exists, has a password, and role matches what the route expects
        if (!user || !user.password || user.role.toLowerCase() !== credentials.role.toLowerCase()) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (passwordsMatch) {
          return { id: user.id, email: user.email, role: user.role };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 4 }, // 4 days
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email;
        if (!email?.endsWith("@vvm.edu.in")) {
          return "/?error=AccessDeniedDomain";
        }
        
        let dbUser = await prisma.user.findUnique({ where: { email } });
        
        if (!dbUser && email === "2411011.meghnath.sdcce@vvm.edu.in") {
          dbUser = await prisma.user.create({
            data: {
              email,
              role: "ADMIN",
            }
          });
        }
        
        if (!dbUser) {
          return "/?error=AccessDeniedProvisioning";
        }
        
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string }});
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      } else if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
