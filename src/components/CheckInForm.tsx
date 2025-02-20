"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Rehearsal, Organization, Group, Student } from "@prisma/client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type RehearsalWithRelations = Rehearsal & {
  organization: Organization;
  groups: (Group & {
    students: Student[];
  })[];
};

const toastClassNames = {
  success: "bg-green-500 text-white font-medium border-none",
  error: "bg-red-500 text-white font-medium border-none",
  warning: "bg-yellow-500 text-white font-medium border-none",
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
  const idLength = students[0]?.studentId.length || 5;
  const queryClient = useQueryClient();
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScanRef = useRef<string>("");
  const { toast } = useToast();

  // Create a Map of studentId to student for O(1) lookups
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    rehearsal.groups.forEach((group) => {
      group.students.forEach((student) => {
        map.set(student.studentId, student);
      });
    });
    return map;
  }, [rehearsal.groups]);

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

  // Focus input on mount and after each scan
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async (scannedId: string) => {
    if (!scannedId.trim()) return;
    if (lastScanRef.current === scannedId) return;
    lastScanRef.current = scannedId;

    // Immediately show feedback if student exists
    const student = studentMap.get(scannedId);
    if (student) {
      toast({
        description: `Welcome, ${student.firstName} ${student.lastName}`,
        className: toastClassNames.success,
      });
    }

    try {
      const response = await fetch(`/api/rehearsals/${rehearsal.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: scannedId,
          rehearsalId: rehearsal.id,
          organizationId: rehearsal.organizationId,
        }),
      });

      const responseText = await response.text();
      if (!responseText) {
        toast({
          description: "No response from server",
          className: toastClassNames.error,
        });
        return;
      }

      const data = JSON.parse(responseText);

      if (data.message?.includes("already checked in")) {
        toast({
          description: data.message,
          className: toastClassNames.warning,
        });
        return;
      }

      if (!response.ok) {
        toast({
          description: data?.error || data?.message || "Failed to check in",
          className: toastClassNames.error,
        });
        return;
      }

      if (!data?.student) {
        toast({
          description: "Invalid student data received",
          className: toastClassNames.error,
        });
        return;
      }

      // Only show success toast if student wasn't in our cache
      if (!student) {
        toast({
          description: `Checked in ${data.student.firstName} ${data.student.lastName}`,
          className: toastClassNames.success,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["attendance", rehearsal.id],
      });
    } catch (error: any) {
      console.error("Check-in Error:", error);
      console.error("Request Data:", {
        studentId: scannedId,
        rehearsalId: rehearsal.id,
        organizationId: rehearsal.organizationId,
      });
      toast({
        description: error.message || "An unexpected error occurred",
        className: toastClassNames.error,
      });
    }

    setStudentId("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStudentId(value);

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Set a new timeout to process the scan
    scanTimeoutRef.current = setTimeout(() => {
      if (value.length >= idLength) {
        // Assuming minimum ID length is 5
        handleScan(value);
      }
    }, 50); // Short delay to catch the full scan
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === "Enter") {
      e.preventDefault();
      if (studentId.trim()) {
        handleScan(studentId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim()) {
      handleScan(studentId);
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
            <Input
              ref={inputRef}
              type="text"
              value={studentId}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Scan or enter student ID"
              className="text-lg h-12"
              autoComplete="off"
            />
            <Button type="submit">Check In</Button>
          </div>
        </form>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8">
          <Toaster />
        </div>
      </div>
    </div>
  );
}
