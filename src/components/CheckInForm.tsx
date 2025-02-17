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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after each submission
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) return;

    try {
      const res = await fetch(`/api/rehearsals/${rehearsal.id}/check-in`, {
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
        setMessage({
          text: `Welcome, ${data.student.firstName}!`,
          type: "success",
        });
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center">
        {orgImage && (
          <div className="mb-8">
            <Image
              src={orgImage}
              alt={orgName}
              width={150}
              height={150}
              className="mx-auto rounded-full"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">{orgName}</h1>
        <h2 className="text-xl text-gray-600 mb-8">Rehearsal Check-in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Scan or enter your student ID"
            className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

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
