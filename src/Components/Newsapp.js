import React, { useEffect, useState, useCallback } from "react";
import Card from "./Card";
import Loader from "./Loader"; 
import logo from "../assets/logos.png";

const Newsapp = () => {
  const [search, setSearch] = useState("india");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 12;

  const [firstLoad, setFirstLoad] = useState(true); 

  const API_KEY = process.env.REACT_APP_NEWS_API_KEY || "";

  
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  
  const fetchNews = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (API_KEY) {
        const q = encodeURIComponent(debouncedSearch || "india");
        const url = `https://newsapi.org/v2/everything?q=${q}&page=${page}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;

        const resp = await fetch(url);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`NewsAPI error: ${resp.status} ${resp.statusText} - ${txt}`);
        }
        const json = await resp.json();
        const articles = (json.articles || []).filter(a => a && a.title);
        setNewsData(articles);
        setTotalResults(json.totalResults || articles.length);
      } else {
        // Fallback to local backend
        const url = `https://news-aggregator-six-fawn.vercel.app/all-news?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(debouncedSearch || "india")}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Backend error: ${resp.status} - ${txt}`);
        }
        const json = await resp.json();
        if (json.success && json.data) {
          const articles = (json.data.articles || []).filter(a => a && a.title);
          setNewsData(articles);
          setTotalResults(json.data.totalResults || articles.length);
        } else {
          throw new Error(json.message || "Unexpected backend response");
        }
      }
    } catch (err) {
      console.error("fetchNews error:", err);
      setError(err.message || "Failed to fetch news");
      setNewsData([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
      setFirstLoad(false); 
    }
  }, [API_KEY, debouncedSearch, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Handlers
  const handleInput = (e) => setSearch(e.target.value);

  const handleSearchClick = () => {
    setDebouncedSearch(search.trim());
    setPage(1);
  };

  const setCategory = (cat) => {
    setSearch(cat);
    setDebouncedSearch(cat);
    setPage(1);
  };

  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function handleNext() {
    const maxPage = Math.max(1, Math.ceil(totalResults / pageSize) || 1);
    setPage((p) => Math.min(maxPage, p + 1));
  }

  const maxPage = Math.max(1, Math.ceil(totalResults / pageSize) || 1);

  return (
    <div>
      {}
      {loading && firstLoad && <Loader fullScreen={true} message="Loading latest news..." />}

      <nav style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <img src={logo} alt="Logo" style={{ height: 40 }} />
               <h1 style={{ margin: 0 }}>Abhi News</h1>
          </div>

        </div>

        <div className="searchBar" style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search News"
            value={search}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClick();
            }}
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>
      </nav>

      <div>
        <p className="head">Real-Time Headlines — Abhi News</p>
      </div>

      <div className="categoryBtn">
        <button onClick={() => setCategory("sports")}>Sports</button>
        <button onClick={() => setCategory("politics")}>Politics</button>
        <button onClick={() => setCategory("entertainment")}>Entertainment</button>
        <button onClick={() => setCategory("health")}>Health</button>
        <button onClick={() => setCategory("fitness")}>Fitness</button>
      </div>

      <div style={{ padding: 12 }}>
        {}
        {loading && !firstLoad && <Loader fullScreen={false} message="Loading..." />}

        {error && <p style={{ color: "red", textAlign: "center" }}>Error: {error}</p>}

        {!loading && !error && newsData && newsData.length > 0 ? (
          <>
            <Card data={newsData} />

            {/* Center page info (kept) */}
            <div className="pagination-center" aria-live="polite" style={{ textAlign: "center", marginTop: 12 , color:'white' }}>
              <span>Page {page} of {maxPage} ({totalResults} results)</span>
            </div>

            {/* Floating animated side buttons */}
            <button
              className={`page-btn left ${page <= 1 ? "disabled" : ""}`}
              onClick={handlePrev}
              aria-label="Previous page"
              disabled={page <= 1}
              title="Previous"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
              </svg>
            </button>

            <button
              className={`page-btn right ${page >= maxPage ? "disabled" : ""}`}
              onClick={handleNext}
              aria-label="Next page"
              disabled={page >= maxPage}
              title="Next"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="currentColor" />
              </svg>
            </button>
          </>
        ) : (
          !loading &&
          !error && <p style={{ textAlign: "center" ,color:'white' }}>No articles found for "{debouncedSearch}".</p>
        )}
      </div>
    </div>
  );
};

export default Newsapp;
