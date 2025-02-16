"use client";

import { useInitialData } from "@/hooks/useInitialData";

export default function ClientWrapper({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: any;
}) {
  useInitialData(initialData);
  return <>{children}</>;
}
