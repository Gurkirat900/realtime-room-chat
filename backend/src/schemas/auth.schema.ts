import { z } from "zod";

export const authSchemas = {
  signup: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};