import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/features/auth/auth-service";
import { useBuilderStore } from "@/stores/builder-store";
import { useSessionStore } from "@/stores/session-store";

export function useSignOut() {
  const queryClient = useQueryClient();
  const localSignOut = useSessionStore((state) => state.signOut);
  const clearDraft = useBuilderStore((state) => state.clearDraft);

  return useMutation({
    mutationFn: signOut,
    onSettled: () => {
      clearDraft();
      queryClient.clear();
      localSignOut();
      router.replace("/auth/sign-in");
    }
  });
}
