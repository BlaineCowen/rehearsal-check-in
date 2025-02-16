import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useInitialData(initialData: any) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData) {
      // Set initial data for user
      queryClient.setQueryData(["user"], initialData.user);
      
      // Set initial data for students
      if (initialData.user?.organizations[0]?.students) {
        queryClient.setQueryData(
          ["students", initialData.user.organizations[0].id],
          initialData.user.organizations[0].students
        );
      }

      // Set initial data for groups
      if (initialData.user?.organizations[0]?.groups) {
        queryClient.setQueryData(
          ["groups", initialData.user.organizations[0].id],
          initialData.user.organizations[0].groups
        );
      }
    }
  }, [initialData, queryClient]);
} 