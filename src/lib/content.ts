import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Post = CollectionEntry<'posts'>;

const visible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;
const newestFirst = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects', visible)).sort(newestFirst);
}

export async function getPosts(): Promise<Post[]> {
  return (await getCollection('posts', visible)).sort(newestFirst);
}

/** A project gets its own page when it has a write-up or an embedded demo. */
export function hasProjectPage(project: Project): boolean {
  return Boolean(project.body?.trim()) || project.data.embed;
}

/** Where a project card should link: its own page, else the demo, else GitHub. */
export function projectHref(project: Project): string | undefined {
  if (hasProjectPage(project)) return `/projects/${project.id}/`;
  return project.data.demo ?? project.data.github;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface LinkItem {
  label: string;
  href: string;
}

/** Demo and source links for a card, minus whatever the card title already links to. */
export function projectLinks(project: Project): LinkItem[] {
  const titleHref = projectHref(project);
  const links: LinkItem[] = [];
  const { demo, github } = project.data;
  if (demo && demo !== titleHref) links.push({ label: 'Live demo', href: demo });
  if (github && github !== titleHref) links.push({ label: 'Source', href: github });
  return links;
}
