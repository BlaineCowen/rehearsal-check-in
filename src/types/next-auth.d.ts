import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
} 