"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Dashboard() {
  const [session, setSession] = useState<User | undefined>();
  const router = useRouter();

  async function getSession() {
    try {
      const { data } = await authClient.getSession();
      if (!session) {
        router.replace("/auth/signin");
      }
      setSession(data?.user);
    } catch (error) {
      console.error("Failed to get session:", error);
      setSession(undefined);
    }
  }

  return (
    <div>
      <Button onClick={getSession}>Get Session</Button>
      <div>
        {session ? (
          <div>
            <p>User ID: {session.id}</p>
            <p>Email: {session.email}</p>
            <p>Name: {session.name}</p>
          </div>
        ) : (
          <p>No session data</p>
        )}
      </div>
      <details>
        <summary>Raw Session Data</summary>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </details>
    </div>
  );
}

export default Dashboard;
