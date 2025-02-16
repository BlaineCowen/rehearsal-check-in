import "./globals.css";
import { Inter } from "next/font/google";
import { auth } from "@/auth";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Attendance",
  description: "Attendance",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <title>Attendance</title>
        <meta name="description" content="Attendance" />
        <link rel="icon" href="/logo.ico" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          <Navbar orgName={session?.user?.organization?.name || ""} />
          <main className="pt-40">{children}</main>
        </Providers>
        <div className="flex w-full justify-center pt-16"></div>
      </body>
    </html>
  );
}
