import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    stories: [
      {
        id: "test1",
        title: "Dodgers Open Spring Training with Full Roster",
        url: "https://www.mlb.com/dodgers",
        source: "MLB.com",
        publishedAt: new Date().toISOString(),
        summary: "The Los Angeles Dodgers opened spring training with a full roster, including Shohei Ohtani and Freddie Freeman. Manager Dave Roberts expressed optimism about the upcoming season.",
        category: "General",
        relevanceScore: 30,
      },
      {
        id: "test2",
        title: "Shohei Ohtani Looks Sharp in First Bullpen Session",
        url: "https://www.mlb.com/dodgers",
        source: "Dodgers Nation",
        publishedAt: new Date().toISOString(),
        summary: "Shohei Ohtani impressed coaches and teammates during his first bullpen session of spring training, throwing with high velocity and sharp command.",
        category: "General",
        relevanceScore: 25,
      },
      {
        id: "test3",
        title: "Freddie Freeman Signs Extension with Dodgers",
        url: "https://www.mlbtraderumors.com/dodgers",
        source: "MLB Trade Rumors",
        publishedAt: new Date().toISOString(),
        summary: "First baseman Freddie Freeman has agreed to a contract extension with the Los Angeles Dodgers, keeping him in blue for several more years.",
        category: "Transactions",
        relevanceScore: 22,
      },
    ],
  });
}
