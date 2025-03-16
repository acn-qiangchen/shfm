import { z } from 'zod';

export const TagSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // HEX color code
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTagSchema = TagSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTagSchema = TagSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>; 