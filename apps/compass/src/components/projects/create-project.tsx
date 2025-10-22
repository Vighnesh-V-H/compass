"use client";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import {
  createProjectSchema,
  CreateProjectInput,
  Visibility,
} from "@compass/schemas";
import { useRouter } from "next/navigation";
import { deleteFromLocalStorage } from "@/lib/localstorage";
import { PROJECTS_KEY } from "@/lib/constants/localstorage";

function CreateProject() {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    mutate: createProject,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const validatedData = createProjectSchema.parse(data);
      deleteFromLocalStorage(PROJECTS_KEY);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/projects`,
        validatedData,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      setOpen(false);
      setName("");
      setVisibility("");
      router.push(`/project/${data.project.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (visibility) {
      createProject({ name, visibility });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className='flex items-center justify-center h-full w-full border border-dashed rounded-lg cursor-pointer hover:border-primary/80 hover:bg-muted/50 transition-colors'>
          <PlusIcon className='size-16 text-muted-foreground' />
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Give your new project a name and choose its visibility. Click
              create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                placeholder='My awesome project'
                className='col-span-3'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='visibility' className='text-right'>
                Visibility
              </Label>
              <Select
                value={visibility}
                onValueChange={(value) => setVisibility(value as Visibility)}
                required>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select visibility' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='public'>Public</SelectItem>
                  <SelectItem value='private'>Private</SelectItem>
                  <SelectItem value='unlisted'>Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isSuccess && (
            <div className='text-sm text-green-600 dark:text-green-400 text-center'>
              Project created successfully! Redirecting...
            </div>
          )}
          {isError && (
            <div className='text-sm text-red-600 dark:text-red-400 text-center'>
              {axios.isAxiosError(error)
                ? error.response?.data?.error || "Failed to create project"
                : "An unexpected error occurred"}
            </div>
          )}
          <DialogFooter>
            <Button type='submit' disabled={isPending || isSuccess}>
              {isPending
                ? "Creating..."
                : isSuccess
                  ? "Success!"
                  : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProject;
