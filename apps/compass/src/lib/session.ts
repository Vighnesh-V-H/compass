"use client";
import { authClient } from "./auth-client";

export const getSession = async () => {
  const session = await authClient.getSession();
  const { data, error } = session;
  return { user: data?.user, error };
};

export const useSession = () => {
  const session = authClient.useSession();

 const token = session.data?.session.token;

 if (!token) {
   return { message: "session token not found please try to login again" };
 }

 if (!session.data?.user) {
   return { message: "Unauthorized" };
 }
 const { data, error, isPending, refetch } = session;
 return { user: data?.user, error, refetch, isPending, token };
};
