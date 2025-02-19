"use client";

import { useState, useRef, useEffect } from "react";
import { Rehearsal, Organization, Group, Student } from "@prisma/client";
import Image from "next/image";

type RehearsalWithRelations = Rehearsal & {
  organization: Organization;
  groups: (Group & {
    students: Student[];
  })[];
};

export default function CheckInForm({
  rehearsal,
  orgName,
  orgImage,
}: {
  rehearsal: RehearsalWithRelations;
  orgName: string;
  orgImage?: string | null;
}) {
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const inputRef = useRef<HTMLInputElement>(null);
  const students = rehearsal.groups.flatMap((g) => g.students);

  // More reliable connection check
  const checkConnection = async () => {
    try {
      await fetch(`/api/rehearsals/${rehearsal.id}/check-in/`, {
        method: "HEAD",
        cache: "no-cache",
      });
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    // Browser events as backup
    const handleOnline = () => checkConnection();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [rehearsal.id]);

  // Focus input on mount and after each submission
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) return; // Prevent submissions when offline
    // check if studentname matches a student
    const student = students.find((s) => s.studentId === studentId);
    if (!student) {
      setMessage({
        text: `${studentId} not found`,
        type: "error",
      });
      // clear input
      setStudentId("");
      inputRef.current?.focus();
      return;
    }
    const studentName =
      students.find((s) => s.studentId === studentId)?.firstName +
      " " +
      students.find((s) => s.studentId === studentId)?.lastName;

    setMessage({
      text: `Welcome, ${studentName}!`,
      type: "success",
    });

    if (!studentId.trim()) return;

    try {
      const res = await fetch(`/api/rehearsals/${rehearsal.id}/check-in/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId.trim(),
          rehearsalId: rehearsal.id,
          organizationId: rehearsal.organizationId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data);
      } else {
        setMessage({ text: data.error || "Student not found", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error checking in", type: "error" });
    }

    setStudentId("");
    inputRef.current?.focus();

    // Clear success message after 3 seconds
    if (message?.type === "success") {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-500 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold mb-4">You are offline</h1>
          <p className="text-xl">
            Please check your internet connection and try again.
          </p>
          <p>Check-ins cannot be processed while offline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
          You are currently offline. Check-ins will be queued until connection
          is restored.
        </div>
      )}
      <div className="w-full max-w-md text-center pb-12">
        {orgImage && (
          <div className="mx-auto min-w-[200px] max-w-[400px] min-h-[200px] max-h-[400px] flex items-center justify-center">
            <Image
              src={orgImage}
              alt={orgName}
              width={400}
              height={400}
              className="w-full h-full"
              priority
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">{orgName}</h1>
        <h2 className="text-xl text-gray-600 mb-8">Rehearsal Check-in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Scan or enter your student ID"
              className="flex-1 px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 text-lg bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors"
            >
              Enter
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
