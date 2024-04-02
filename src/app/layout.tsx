import "./globals.css";
import { Inter } from "next/font/google";
import Image from "next/image";
// import "tailwindcss/tailwind.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Attendance",
  description: "Attendance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Attendance</title>
        <meta name="description" content="Attendance" />
        <link rel="icon" href="/logo.ico" />
      </head>
      <body className={inter.className}>
        {children}
        <div className="flex w-full justify-center pt-16"></div>
      </body>
    </html>
  );
}
