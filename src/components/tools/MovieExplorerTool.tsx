"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Film, Star, ExternalLink, Loader2 } from "lucide-react";

export default function MovieExplorerTool() {
  const [query, setQuery] = useState<string>("");
  const [genre, setGenre] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMovies = useCallback(async (q: string, g: string, y: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?q=${encodeURIComponent(q)}&genre=${g}&year=${y}`);
      const data = await res.json();
      if (data.success) {
        setMovies(data.movies || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMovies("", "All", "All");
  }, [fetchMovies]);

  const handleSearch = () => {
    void fetchMovies(query, genre, year);
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">🎬</span>
          <div>
            <div className="tool-category-badge">DAILY & FINANCE</div>
            <h1 className="tool-title">Movie & TV Explorer</h1>
            <p className="tool-desc">
              Search and discover movies and shows powered by live open TVMaze directory with release year and genre filters.
            </p>
          </div>
        </div>
      </div>

      <div className="movies-container">
        <div className="movies-toolbar">
          {/* Search bar */}
          <div className="movies-search-row">
            <div className="movies-search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search movie or TV show title (e.g. Inception, Breaking Bad, Batman...)"
              />
            </div>
            <button className="run-button" onClick={handleSearch} style={{ padding: "9px 18px" }}>
              <Search size={14} /> Search
            </button>
          </div>

          {/* Genre Filters */}
          <div className="movies-filters-row">
            <span className="filter-label">GENRE:</span>
            {["All", "Action", "Drama", "Comedy", "Sci-Fi", "Crime", "Thriller", "Animation", "Fantasy", "Horror"].map((g) => (
              <button
                key={g}
                className={`pill-choice ${genre === g ? "active" : ""}`}
                onClick={() => {
                  setGenre(g);
                  void fetchMovies(query, g, year);
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Year Filters */}
          <div className="movies-filters-row">
            <span className="filter-label">RELEASE YEAR:</span>
            {["All", "2025", "2024", "2023", "2022", "2021", "2020", "2010s", "2000s", "1990s"].map((y) => (
              <button
                key={y}
                className={`pill-choice ${year === y ? "active" : ""}`}
                onClick={() => {
                  setYear(y);
                  void fetchMovies(query, genre, y);
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div style={{ display: "grid", placeItems: "center", padding: "60px 20px", color: "var(--muted)", gap: "12px" }}>
            <Loader2 size={30} className="spin" />
            <span>Loading titles from live TVMaze directory...</span>
          </div>
        ) : movies.length === 0 ? (
          <div className="mail-empty-state">
            <Film size={36} style={{ opacity: 0.4 }} />
            <strong>No movies or shows found</strong>
            <p>Try searching for a different keyword or resetting the genre/year filters.</p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((m) => (
              <div key={m.id} className="movie-card">
                <div className="movie-poster-wrap">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="movie-poster-img" loading="lazy" />
                  ) : (
                    <div className="movie-poster-fallback">
                      <Film size={32} />
                      <span>No Poster</span>
                    </div>
                  )}
                  {m.rating && (
                    <span className="movie-rating-badge">
                      <Star size={12} fill="#fbbf24" stroke="none" />
                      {m.rating}
                    </span>
                  )}
                  {m.year && (
                    <span className="movie-year-badge">
                      {m.year}
                    </span>
                  )}
                </div>

                <div className="movie-content">
                  <h4 className="movie-title" title={m.name}>{m.name}</h4>
                  <div className="movie-genres-row">
                    {(m.genres || []).slice(0, 3).map((g: string) => (
                      <span key={g} className="movie-genre-tag">{g}</span>
                    ))}
                  </div>
                  <p className="movie-synopsis">{m.summary || "No synopsis available."}</p>

                  <div className="movie-card-footer">
                    <span style={{ fontSize: "11px", color: "var(--subtle)" }}>{m.network || "Stream"}</span>
                    <a
                      href={m.officialSite}
                      target="_blank"
                      rel="noreferrer"
                      className="movie-link-btn"
                    >
                      View Details <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
