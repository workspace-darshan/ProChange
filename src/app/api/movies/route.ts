import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";

  try {
    let items: any[] = [];

    if (query.trim()) {
      // Search TVMaze by title
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const searchData = await res.json();
        items = searchData.map((d: any) => d.show);
      }
    } else {
      // Fetch popular/top shows page
      const res = await fetch("https://api.tvmaze.com/shows?page=1", {
        headers: { "Accept": "application/json" },
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        items = await res.json();
      }
    }

    // Format results
    let formatted = items.map((show: any) => {
      const premieredYear = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : null;
      // Strip HTML from summary
      const cleanSummary = (show.summary || "")
        .replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");

      return {
        id: show.id,
        name: show.name,
        type: show.type || "Show",
        language: show.language || "English",
        genres: show.genres || [],
        status: show.status || "Ended",
        runtime: show.runtime || show.averageRuntime || 45,
        premiered: show.premiered || "Unknown",
        year: premieredYear,
        rating: show.rating?.average || null,
        network: show.network?.name || show.webChannel?.name || "Streaming",
        image: show.image?.medium || show.image?.original || null,
        banner: show.image?.original || show.image?.medium || null,
        summary: cleanSummary,
        officialSite: show.officialSite || show.url || `https://www.tvmaze.com/shows/${show.id}`,
      };
    });

    // Filter by genre if specified
    if (genre && genre !== "All") {
      formatted = formatted.filter((item) =>
        item.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    // Filter by year if specified
    if (year && year !== "All") {
      if (year === "2010s") {
        formatted = formatted.filter((item) => item.year && item.year >= 2010 && item.year <= 2019);
      } else if (year === "2000s") {
        formatted = formatted.filter((item) => item.year && item.year >= 2000 && item.year <= 2009);
      } else if (year === "1990s") {
        formatted = formatted.filter((item) => item.year && item.year >= 1990 && item.year <= 1999);
      } else {
        const targetYear = parseInt(year, 10);
        if (!isNaN(targetYear)) {
          formatted = formatted.filter((item) => item.year === targetYear);
        }
      }
    }

    // Sort by rating desc
    formatted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return NextResponse.json({
      success: true,
      total: formatted.length,
      movies: formatted.slice(0, 50),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
