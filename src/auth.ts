import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "database",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to home after sign in
      return baseUrl;
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