import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow URLs from same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, user }) {
      const userWithOrg = await prisma.user.findUnique({
        where: { id: user.id },
        include: { organizations: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          organizations: userWithOrg?.organizations || [],
        },
      };
    },
  },
})