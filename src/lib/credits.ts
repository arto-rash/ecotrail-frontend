import credits from "../../public/images/trails/credits.json";

export type Credit = { title: string; author: string; license: string; source: string };

const byPath = new Map<string, Credit>(
  Object.entries(credits as Record<string, Credit>).map(([slug, c]) => [`/images/trails/${slug}.jpg`, c]),
);

export function creditFor(path: string | null | undefined): Credit | undefined {
  return path ? byPath.get(path) : undefined;
}

export const allCredits = Object.entries(credits as Record<string, Credit>);
