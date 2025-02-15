"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

// make a page where a user can create an organization
export default function CreateOrg() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email },
    });
  };

  return (
    <div>
      <h1>Create Organization</h1>
    </div>
  );
}
