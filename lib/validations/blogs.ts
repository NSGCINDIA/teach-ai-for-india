import { z } from 'zod'

// Preprocessor to clean and parse comma-separated text into a clean string array
const stringToArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return val
}, z.array(z.string()))

export const upsertBlogSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters long').max(300, 'Summary cannot exceed 300 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  cover_image: z.string().optional().nullable().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  tags: stringToArray.default([]),
  
  // SEO Meta section
  seo_title: z.string().max(100, 'SEO Title cannot exceed 100 characters').optional().nullable().or(z.literal('')),
  meta_description: z.string().max(300, 'Meta description cannot exceed 300 characters').optional().nullable().or(z.literal('')),
  keywords: stringToArray.default([]),
  og_image: z.string().optional().nullable().or(z.literal('')),
  canonical_url: z.string().optional().nullable().or(z.literal('')),
})

export const deleteBlogSchema = z.object({
  id: z.string().uuid()
})

export const reviewBlogSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'published', 'rejected']),
  rejected_reason: z.string().optional().nullable().or(z.literal('')),
})
