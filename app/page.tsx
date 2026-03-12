import { DigestPage } from "@/components/DigestPage";
import { buildDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function Home() {
  const stories = await buildDigest().catch(() => []);
  const date = new Date().toISOString().slice(0, 10);
  return <DigestPage initialStories={stories} date={date} />;
}
