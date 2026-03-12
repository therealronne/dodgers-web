import { promises as fs } from "fs";
import path from "path";
import type { DigestCache, Story } from "./types";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "digest.json");

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function readCache(): Promise<Story[] | null> {
  try {
    await ensureDir();
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const cached: DigestCache = JSON.parse(raw);
    if (cached.date === todayKey()) {
      console.log("[cache] Cache hit for", cached.date);
      return cached.stories;
    }
    console.log("[cache] Cache expired (was", cached.date, ", today is", todayKey(), ")");
    return null;
  } catch {
    return null;
  }
}

export async function writeCache(stories: Story[]): Promise<void> {
  await ensureDir();
  const data: DigestCache = {
    date: todayKey(),
    stories,
    fetchedAt: new Date().toISOString(),
  };
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  console.log("[cache] Wrote cache for", data.date, "with", stories.length, "stories");
}

export async function invalidateCache(): Promise<void> {
  try {
    await fs.unlink(CACHE_FILE);
  } catch {
    // ignore
  }
}
