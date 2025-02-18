import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { User, Organization, Student, Group, Rehearsal } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type UserWithOrganization = User & {
  organizations: (Organization & {
    students: Student[];
    groups: (Group & {
      students: Student[];
    })[];
  })[];
};

export function useUser() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user/get-current");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (userQuery.data && !userQuery.data.organizations?.[0]) {
      router.replace("/create-org");
    }
  }, [userQuery.data, router]);

  return {
    ...userQuery,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      return userQuery.refetch();
    }
  };
}

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