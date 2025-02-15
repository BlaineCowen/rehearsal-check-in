"use server";

import { signIn } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  await signIn("google");
  redirect("/");
}

export async function createOrganization(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.organization.create({
    data: {
      name,
      userId: user.id
    }
  });
}

export async function importStudents(csvData: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });

  if (!user?.organizations[0]?.id) {
    throw new Error("Organization not found");
  }

  const rows = csvData.split("\n");
  const students = rows.map((row) => {
    const [firstName, lastName, studentId, grade] = row.split(",");
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studentId: studentId.trim(),
      grade: grade?.trim(),
      organizationId: user.organizations[0].id,
    };
  });

  await prisma.student.createMany({
    data: students,
    skipDuplicates: true,
  });
} 