"use client";
import Link from "next/link";
import { Project } from "@compass/schemas";
import { MoreVertical, Trash2, Share2, EditIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { deleteFromLocalStorage } from "@/lib/localstorage";
import { PROJECTS_KEY } from "@/lib/constants/localstorage";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/project/${projectId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      deleteFromLocalStorage(PROJECTS_KEY);
    },
    onError: (error: unknown) => {
      console.error("Failed to delete project:", error);
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Share project:", project.id);
  };

  return (
    <div className='group relative flex flex-col'>
      <Link href={`/project/${project.id}`} className='cursor-pointer'>
        <div className=' flex flex-col items-start bg-foreground/5 p-2 rounded-lg  justify-between gap-2'>
          <div className='w-full h-30 border rounded-lg cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1 bg-background relative'>
            <div className='absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg' />
          </div>
          <div className='flex w-full justify-between pl-1'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-sm truncate'>{project.name}</h3>
              <p className='text-xs text-muted-foreground capitalize'>
                {project.visibility}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className='p-1 hover:bg-muted rounded transition-colors'
                  onClick={(e) => e.preventDefault()}>
                  <MoreVertical className='size-4 text-muted-foreground' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className='size-4 mr-2' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <EditIcon className='size-4 mr-2' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className='text-red-600'>
                  <Trash2 className='size-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProjectCard;
