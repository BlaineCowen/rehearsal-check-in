import CreateOrganization from "@/components/CreateOrganization";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CreateOrgPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth");
  }

  return <CreateOrganization />;
}
