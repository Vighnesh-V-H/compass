"use client";
import Loader from "@/components/loader";
import CreateProject from "@/components/projects/create-project";
import { useSession } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function Projects() {
  const { error, user, isPending } = useSession();

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get("/api/projects/get");
      return response.data;
    },
    enabled: !!user?.emailVerified,
  });

  if (isPending) {
    return <Loader />;
  }

  if (!user || !user.emailVerified) {
    return <div>not verified</div>;
  }

  return (
    <div>
      <CreateProject />
    </div>
  );
}

export default Projects;
