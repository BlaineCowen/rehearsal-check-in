import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { User, Organization, Student, Group, Rehearsal } from "@prisma/client";
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


// export function useOrganization() {
//   const { data: user } = useUser();
//   // get organization from user
//   const organization = user?.organizations.find((org: Organization) => org.id === user?.organizations[0].id);
//   return organization;
// }

// export function useStudents() {
//   const organization = useOrganization();
//   return useQuery({
//     queryKey: ["students", organization?.id],
//     queryFn: async () => {
//       const res = await fetch(`/api/students/get-all?organizationId=${organization?.id}`);
//       if (!res.ok) throw new Error("Failed to fetch students");
//       return res.json();
//     },
//     enabled: !!organization?.id,
//   });
// }

// export function useGroups() {
//   const organization = useOrganization();
  
//   return useQuery({
//     queryKey: ["groups", organization?.id],
//     queryFn: async () => {
//       const res = await fetch(`/api/groups?organizationId=${organization?.id}`);
//       if (!res.ok) throw new Error("Failed to fetch groups");
//       return res.json();
//     },
//     enabled: !!organization?.id,
//   });
// } 

export function useActiveRehearsals(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["activeRehearsals", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization ID");
      const res = await fetch(`/api/rehearsals/active?organizationId=${organizationId}`);
      if (!res.ok) throw new Error("Failed to fetch active rehearsals");
      return res.json();
    },
    enabled: !!organizationId,
    staleTime: 0, // Always refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
} 

export function useEndRehearsal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rehearsalId: string) => {
      const res = await fetch("/api/rehearsals/end", {
        method: "POST",
        body: JSON.stringify({ rehearsalId }),
      });
      if (!res.ok) throw new Error("Failed to end rehearsal");
      return res.json();
    },
    onMutate: async (rehearsalId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ["activeRehearsals"],
        exact: true 
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["activeRehearsals"]);

      // Get all matching queries
      const queries = queryClient.getQueriesData({ queryKey: ["activeRehearsals"] });

      // Update all matching queries
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return [];
          return old.filter((rehearsal: any) => rehearsal.id !== rehearsalId);
        });
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      // On error, roll back
      if (context?.previousData) {
        const queries = queryClient.getQueriesData({ queryKey: ["activeRehearsals"] });
        queries.forEach(([queryKey]) => {
          queryClient.setQueryData(queryKey, context.previousData);
        });
      }
    },
    onSuccess: () => {
      // Don't refetch, trust our optimistic update
      // queryClient.invalidateQueries({ queryKey: ["activeRehearsals"] });
    },
    onSettled: () => {
      // Optionally refetch after a delay to ensure sync
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ["activeRehearsals"],
          exact: true
        });
      }, 1000);
    }
  });
} 