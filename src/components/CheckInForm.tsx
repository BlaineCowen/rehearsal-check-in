"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Rehearsal, Organization, Group, Student } from "@prisma/client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
    id: number;
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

  // Move checkConnection inside useEffect to avoid dependency issues
  useEffect(() => {
    // Define checkConnection inside the effect
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

    // Clear input immediately
    setStudentId("");
    inputRef.current?.focus();

    // Immediately show feedback if student exists
    const student = studentMap.get(scannedId);
    if (student) {
      showNotification(
        `Welcome, ${student.firstName} ${student.lastName}`,
        "success"
      );
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
        showNotification("No response from server", "error");
        return;
      }

      const data = JSON.parse(responseText);

      if (data.message?.includes("already checked in")) {
        showNotification(data.message, "warning");
        return;
      }

      if (!response.ok) {
        showNotification(
          data?.error || data?.message || "Failed to check in",
          "error"
        );
        return;
      }

      if (!data?.student) {
        showNotification("Invalid student data received", "error");
        return;
      }

      // Only show success toast if student wasn't in our cache
      if (!student) {
        showNotification(
          `Checked in ${data.student.firstName} ${data.student.lastName}`,
          "success"
        );
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
      showNotification(
        error.message || "An unexpected error occurred",
        "error"
      );
    }
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
    if (e.key === "Enter") {
      e.preventDefault();
      if (studentId.trim()) {
        handleScan(studentId);
        setStudentId(""); // Clear immediately on Enter
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim()) {
      handleScan(studentId);
      setStudentId(""); // Clear immediately on submit
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setNotification({
      message,
      type,
      id: Date.now(), // Used to force re-render for repeated messages
    });
    // Auto-hide after 2 seconds
    setTimeout(() => {
      setNotification(null);
    }, 2000);
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-base-300">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-red-500 text-base-300-content text-center text-lg">
          You are currently offline. Check-ins will be queued until connection
          is restored.
        </div>
      )}
      <div className="w-full max-w-2xl text-center pb-12">
        {orgImage && (
          <div className="mx-auto mb-8 min-w-[300px] max-w-[500px] min-h-[300px] max-h-[500px] flex items-center justify-center">
            <Image
              src={orgImage}
              alt={orgName}
              width={500}
              height={500}
              className="w-full h-full"
              priority
            />
          </div>
        )}

        <h1 className="text-5xl font-bold mb-4">{orgName}</h1>
        <h2 className="text-2xl text-base-300-content mb-12">
          Rehearsal Check-in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <Input
              ref={inputRef}
              type="text"
              value={studentId}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Scan or enter student ID"
              className="text-2xl h-16 bg-base-200 border-base-300-content flex-1 px-6 placeholder:text-2xl [&:not(:placeholder-shown)]:text-2xl"
              autoComplete="off"
            />
            <Button className="text-xl h-16 px-8" type="submit">
              Check In
            </Button>
          </div>
        </form>

        <div className="h-20 mt-8">
          {" "}
          {/* Fixed height to prevent layout shift */}
          {notification && (
            <div
              key={notification.id}
              className={cn(
                "px-6 py-4 rounded-lg text-white text-xl transition-all duration-300",
                {
                  "bg-green-500": notification.type === "success",
                  "bg-red-500": notification.type === "error",
                  "bg-yellow-500": notification.type === "warning",
                }
              )}
            >
              {notification.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
