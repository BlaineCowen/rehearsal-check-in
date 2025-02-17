import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Organization, Student, Group } from "@prisma/client";
import { useSession } from "next-auth/react";

type UserWithOrganization = User & {
  organizations: (Organization & {
    students: Student[];
    groups: (Group & {
      students: Student[];
    })[];
  })[];
};

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user/get-current");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false,
  });
}

export function useOrganization() {
  const { data: user } = useUser();
  // get organization from user
  const organization = user?.organizations.find((org: Organization) => org.id === user?.organizations[0].id);
  return organization;
}

export function useStudents() {
  const organization = useOrganization();
  return useQuery({
    queryKey: ["students", organization?.id],
    queryFn: async () => {
      const res = await fetch(`/api/students/get-all?organizationId=${organization?.id}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: !!organization?.id,
  });
}

export function useGroups() {
  const organization = useOrganization();
  
  return useQuery({
    queryKey: ["groups", organization?.id],
    queryFn: async () => {
      const res = await fetch(`/api/groups?organizationId=${organization?.id}`);
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
    enabled: !!organization?.id,
  });
} 

export function useActiveRehearsals() {
  const organization = useOrganization();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["activeRehearsals", organization?.id],
    queryFn: async () => {
      const res = await fetch(`/api/rehearsals/active?organizationId=${organization?.id}`);
      if (!res.ok) throw new Error("Failed to fetch active rehearsals");
      return res.json();
    },
    enabled: !!organization?.id,
    staleTime: 0, // Always refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
} 