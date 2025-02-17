"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8">Attendance Tracker</h1>
        <button className="bg-blue-500 text-white px-6 py-2 rounded">
          Sign In
        </button>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/groups/create"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Create Group</h2>
          <p>Create a new group and upload group image</p>
        </Link>

        <Link
          href="/students/import"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Import Students</h2>
          <p>Upload or manually add student information</p>
        </Link>

        <Link
          href="/rehearsals/new"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Start Rehearsal</h2>
          <p>Create a new rehearsal session</p>
        </Link>
      </div>
    </main>
  );
}
