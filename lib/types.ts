export type Category =
  | "Injuries"
  | "Transactions"
  | "Game Recaps"
  | "Opinion"
  | "General";

export interface RawStory {
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  content?: string;
  snippet?: string;
}

export interface Story {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO string
  summary: string;
  category: Category;
  relevanceScore: number;
  imageUrl?: string;
}

export interface DigestCache {
  date: string; // YYYY-MM-DD
  stories: Story[];
  fetchedAt: string; // ISO string
}
