"use client";

import Dashboard from "@/components/Dashboard";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div>
      <Navbar orgName={session?.user?.organization?.name || ""} />
      <Dashboard />
    </div>
  );
}
