"use server";

import { signIn } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Student } from "@prisma/client";
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
    where: { email: session.user.email },
    include: { organizations: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.organizations.length > 0) {
    throw new Error("User already has an organization");
  }

  try {
    // Create organization and "All" group in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          userId: user.id,
        },
      });

      // Create "All" group
      await tx.group.create({
        data: {
          name: "All",
          organizationId: org.id,
        },
      });

      return org;
    });

    return result;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("An organization with this name already exists");
    }
    throw error;
  }
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

  const orgId = user.organizations[0].id;

  // Find "All" group
  const allGroup = await prisma.group.findFirst({
    where: {
      name: "All",
      organizationId: orgId,
    },
  });

  if (!allGroup) {
    throw new Error("All group not found");
  }

  const rows = csvData.split("\n");
  
  // Create students and connect them to "All" group in a transaction
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const [firstName, lastName, studentId, grade] = row.split(",");
      await tx.student.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          studentId: studentId.trim(),
          grade: grade?.trim(),
          organizationId: orgId,
          groups: {
            connect: {
              id: allGroup.id,
            },
          },
        },
      });
    }
  });
}

export async function createStudent(formData: {
  firstName: string;
  lastName: string;
  studentId: string;
  grade?: string;
}) {
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

  const orgId = user.organizations[0].id;

  // Find "All" group
  const allGroup = await prisma.group.findFirst({
    where: {
      name: "All",
      organizationId: orgId,
    },
  });

  if (!allGroup) {
    throw new Error("All group not found");
  }

  // Create student and connect to "All" group
  await prisma.student.create({
    data: {
      ...formData,
      organizationId: orgId,
      groups: {
        connect: {
          id: allGroup.id,
        },
      },
    },
  });
}

export async function updateStudents(students: Student[]) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true }
  })

  if (!user?.organizations[0]?.id) throw new Error("Organization not found")

  await prisma.$transaction([
    prisma.student.deleteMany({
      where: { organizationId: user.organizations[0].id }
    }),
    prisma.student.createMany({
      data: students.map(s => ({
        ...s,
        organizationId: user.organizations[0].id
      }))
    })
  ])
} 