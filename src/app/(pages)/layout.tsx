"use client";

import Navbar from "@/components/Navbar";

import { useSession } from "next-auth/react";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar orgName={session?.user?.organization?.name || ""} />
      {children}
    </div>
  );
}
