import * as z from "zod";


export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]),
  firstName: z.string().nullable().optional().or(z.literal("")),
  lastName: z.string().nullable().optional().or(z.literal("")),
  defaultTimezone: z.string().optional(),
  dateFormat: z.string().optional()
})

export const UpdateUserSchema = CreateUserSchema.omit({ password: true }).extend({
  id: z.string(),
  defaultTimezone: z.string().optional(),
  dateFormat: z.string().optional()
})

export const UpdateUserPasswordSchema = z.object({
  id: z.string(),
  currentPassword: z.string(),
  newPassword: z.string().min(4)
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export type UpdateUserPasswordDto = z.infer<typeof UpdateUserPasswordSchema>;