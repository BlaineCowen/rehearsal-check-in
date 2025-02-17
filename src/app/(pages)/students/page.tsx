import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentsPage from "@/components/StudentsPage";

export default async function Students() {
  return <StudentsPage />;
}
