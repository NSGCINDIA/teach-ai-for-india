import { z } from 'zod'

export const blogFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(100),
  body: z.string().trim().min(20, 'Content must be at least 20 characters long'),
})

export const reviewBlogSchema = z.object({
  blog_id: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().optional(),
})

export type BlogFormInput = z.infer<typeof blogFormSchema>
export type ReviewBlogInput = z.infer<typeof reviewBlogSchema>
