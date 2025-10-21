import { z } from "zod";

export const visibilityEnum = z.enum(["public", "private", "unlisted"]);

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  visibility: visibilityEnum,
});

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  visibility: visibilityEnum,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Visibility = z.infer<typeof visibilityEnum>;
