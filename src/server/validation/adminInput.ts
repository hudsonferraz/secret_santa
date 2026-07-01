import { z } from "zod";

export const eventTitleSchema = z.string().trim().min(1).max(120);
export const eventDescriptionSchema = z.string().trim().min(1).max(500);
export const groupNameSchema = z.string().trim().min(1).max(80);
export const personNameSchema = z.string().trim().min(1).max(120);

export const createEventSchema = z.object({
  title: eventTitleSchema,
  description: eventDescriptionSchema,
  grouped: z.boolean(),
});

export const updateEventSchema = z.object({
  status: z.boolean().optional(),
  title: eventTitleSchema.optional(),
  description: eventDescriptionSchema.optional(),
  grouped: z.boolean().optional(),
});

export const createGroupSchema = z.object({
  name: groupNameSchema,
});

export const updateGroupSchema = z.object({
  name: groupNameSchema.optional(),
});

export const createPersonSchema = z.object({
  name: personNameSchema,
});

export const updatePersonSchema = z.object({
  name: personNameSchema.optional(),
});
