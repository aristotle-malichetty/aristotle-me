import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdoc}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    coverImage: image().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdoc}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().optional(),
    github: z.string().optional(),
    coverImage: image().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['live', 'building', 'idea']).default('idea'),
    order: z.number().default(0),
  }),
});

export const collections = { blog, projects };
