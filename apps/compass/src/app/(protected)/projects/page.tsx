"use client";
import Loader from "@/components/loader";
import CreateProject from "@/components/projects/create-project";
import ProjectCard from "@/components/projects/project-card";
import { useSession } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@compass/schemas";

function Projects() {
  const { error, user, isPending } = useSession();
  const MINUTES = 30;

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/projects`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!user?.emailVerified,
    gcTime: 1000 * MINUTES,
  });

  if (isPending || isLoading) {
    return <Loader />;
  }

  if (!user || !user.emailVerified) {
    return <div>not verified</div>;
  }

  const projects: Project[] = data?.projects || [];

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Projects</h1>
        <p className='text-muted-foreground mt-2'>
          Manage your survey projects
        </p>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
        <CreateProject />
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Projects;
