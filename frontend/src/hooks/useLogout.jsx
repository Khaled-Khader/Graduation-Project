import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LogoutFetchData } from "../util/http";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: LogoutFetchData,
    onMutate: () => {
      queryClient.cancelQueries();
      localStorage.removeItem("clinicId");
      queryClient.setQueryData(["user"], null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "user",
      });
      navigate("/sign-in", { replace: true });
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
  };
}
