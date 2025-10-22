import { authClient } from "@/lib/auth-client";
import { User } from "@/types";

export const useCurrentUser = (): User | null => {
  const { data } = authClient.useSession();
  if (!data || !data.user) {
    return null;
  }
  return data.user;
};
