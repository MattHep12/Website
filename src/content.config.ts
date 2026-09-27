import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .md file in src/content/projects becomes a project.
// The file name (minus .md) is its URL slug: life.md -> /projects/life/
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        // One or two sentences, shown on cards and as the meta description.
        description: z.string(),
        // Used for sorting (newest first). Start date or last significant update.
        date: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        // Optional screenshot, relative to the Markdown file, e.g. ./life.png
        cover: image().optional(),
        // Required whenever `cover` is set. Describe what the image shows.
        coverAlt: z.string().optional(),
        github: z.url().optional(),
        // Live demo: an external URL or a local demo path like /demos/my-demo/
        demo: z.string().optional(),
        // Embed the local demo in an iframe on the project page.
        embed: z.boolean().default(false),
        embedHeight: z.number().int().positive().default(520),
        // Featured projects appear on the home page.
        featured: z.boolean().default(false),
        // Drafts show up in `npm run dev` but are left out of the production build.
        draft: z.boolean().default(false),
      })
      .refine((p) => !p.cover || p.coverAlt, {
        message: 'coverAlt is required when cover is set (it is the image alt text).',
        path: ['coverAlt'],
      })
      .refine((p) => !p.embed || p.demo?.startsWith('/'), {
        message: 'embed: true needs `demo` to be a local path like /demos/my-demo/',
        path: ['embed'],
      }),
});

// Every .md file in src/content/posts becomes a post under /misc/.
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts };
