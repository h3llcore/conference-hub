import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  FileText,
  LibraryBig,
  RotateCcw,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { getVenues } from "../features/venues/venues.api";
import {
  apiGetHomeContent,
  apiGetHomeStats,
  apiSearchArticles,
  type HomeContent,
  type HomeStats,
} from "../features/home/home.api";
import "../styles/home.css";

type Venue = {
  id: string;
  title: string;
  description?: string;
  type: "JOURNAL" | "CONFERENCE";
  deadline?: string;
  rating?: number;
};

function formatDate(date?: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRating(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0.0";
  }

  return value.toFixed(1);
}

const emptyStats: HomeStats = {
  articles: 0,
  conferences: 0,
  journals: 0,
  users: 0,
  reviewers: 0,
  publicationIssues: 0,
};

export default function HomePage() {
  const [latestJournals, setLatestJournals] = useState<Venue[]>([]);
  const [popularArticles, setPopularArticles] = useState<HomeContent[]>([]);
  const [newsItems, setNewsItems] = useState<HomeContent[]>([]);
  const [stats, setStats] = useState<HomeStats>(emptyStats);

  const [authorSearch, setAuthorSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [loadingJournals, setLoadingJournals] = useState(true);
  const [loadingHomeContent, setLoadingHomeContent] = useState(true);
  const [searching, setSearching] = useState(false);

  async function loadHomeContent(isMounted = true) {
    try {
      setLoadingHomeContent(true);

      const data = await apiGetHomeContent();

      if (isMounted) {
        setPopularArticles(data.articles || []);
        setNewsItems(data.news || []);
      }
    } catch (e) {
      console.error(e);

      if (isMounted) {
        setPopularArticles([]);
        setNewsItems([]);
      }
    } finally {
      if (isMounted) {
        setLoadingHomeContent(false);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadLatestJournals() {
      try {
        setLoadingJournals(true);

        const data = await getVenues({
          type: "JOURNAL",
          limit: 4,
          sort: "newest",
        });

        if (isMounted) {
          setLatestJournals(data.venues || []);
        }
      } catch (e) {
        console.error(e);

        if (isMounted) {
          setLatestJournals([]);
        }
      } finally {
        if (isMounted) {
          setLoadingJournals(false);
        }
      }
    }

    async function loadStats() {
      try {
        const data = await apiGetHomeStats();

        if (isMounted) {
          setStats(data.stats || emptyStats);
        }
      } catch (e) {
        console.error(e);

        if (isMounted) {
          setStats(emptyStats);
        }
      }
    }

    loadLatestJournals();
    loadHomeContent(isMounted);
    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSearch() {
    const hasSearch = authorSearch.trim() || querySearch.trim();

    if (!hasSearch) {
      await handleResetSearch();
      return;
    }

    try {
      setSearching(true);
      setLoadingHomeContent(true);
      setIsSearchMode(true);

      const data = await apiSearchArticles({
        query: querySearch.trim(),
        author: authorSearch.trim(),
      });

      setPopularArticles(data.articles || []);
    } catch (e) {
      console.error(e);
      setPopularArticles([]);
    } finally {
      setSearching(false);
      setLoadingHomeContent(false);
    }
  }

  async function handleResetSearch() {
    setAuthorSearch("");
    setQuerySearch("");
    setIsSearchMode(false);
    await loadHomeContent(true);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Наукова платформа</p>

          <h1 className="home-hero__title">
            Conference Hub – вебресурс для конференцій та наукових журналів
          </h1>

          <p className="home-hero__description">
            Зручний простір для пошуку журналів, перегляду актуальних статей,
            відстеження новин та організації подання наукових матеріалів.
          </p>

          <div className="home-hero__actions">
            <Link
              to="/journals"
              className="home-hero__button home-hero__button--primary"
            >
              Почати пошук
            </Link>

            <Link
              to="/register"
              className="home-hero__button home-hero__button--secondary"
            >
              Створити акаунт
            </Link>
          </div>
        </div>
      </div>

      <div className="home-stats">
        <div className="home-stat-card">
          <div className="home-stat-card__icon">
            <FileText size={20} />
          </div>

          <div>
            <strong>{stats.articles}</strong>
            <span>Опублікованих статей</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-card__icon">
            <BookOpen size={20} />
          </div>

          <div>
            <strong>{stats.conferences}</strong>
            <span>Конференцій</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-card__icon">
            <LibraryBig size={20} />
          </div>

          <div>
            <strong>{stats.journals}</strong>
            <span>Наукових журналів</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-card__icon">
            <UsersRound size={20} />
          </div>

          <div>
            <strong>{stats.users}</strong>
            <span>Користувачів платформи</span>
          </div>
        </div>
      </div>

      <div className="home-search">
        <div className="home-search__grid">
          <div className="home-search__field">
            <label htmlFor="author-search">Пошук за автором або напрямком</label>

            <input
              id="author-search"
              type="text"
              value={authorSearch}
              onChange={(event) => setAuthorSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Введіть автора або науковий напрям"
            />
          </div>

          <div className="home-search__field">
            <label htmlFor="article-search">
              Пошук за назвою або ключовими словами
            </label>

            <input
              id="article-search"
              type="text"
              value={querySearch}
              onChange={(event) => setQuerySearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Введіть назву статті або ключові слова"
            />
          </div>

          <div className="home-search__actions">
            {isSearchMode && (
              <button
                type="button"
                className="home-search__filter"
                onClick={handleResetSearch}
              >
                <RotateCcw size={16} />
                <span>Скинути</span>
              </button>
            )}

            <button
              type="button"
              className="home-search__button"
              onClick={handleSearch}
              disabled={searching}
            >
              <SlidersHorizontal size={16} />
              <span>{searching ? "Пошук..." : "Пошук"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="home-layout">
        <aside className="home-sidebar">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Доступні журнали</h2>
              <Link to="/journals">Усі журнали</Link>
            </div>

            <div className="home-journals">
              {loadingJournals && <div>Завантаження журналів...</div>}

              {!loadingJournals && latestJournals.length === 0 && (
                <div>Поки що журналів немає.</div>
              )}

              {!loadingJournals &&
                latestJournals.length > 0 &&
                latestJournals.map((journal) => (
                  <Link
                    key={journal.id}
                    to={`/journals/${journal.id}`}
                    className="home-journal-card"
                  >
                    <div>
                      <h3>{journal.title}</h3>
                      <p>Наукове видання</p>
                    </div>

                    <span>{formatRating(journal.rating)}</span>
                  </Link>
                ))}
            </div>
          </div>
        </aside>

        <main className="home-main">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>{isSearchMode ? "Результати пошуку" : "Популярні статті"}</h2>
              <Link to="/journals">Дивитися всі</Link>
            </div>

            <div className="home-articles">
              {loadingHomeContent && (
                <div>
                  {isSearchMode ? "Пошук статей..." : "Завантаження статей..."}
                </div>
              )}

              {!loadingHomeContent && popularArticles.length === 0 && (
                <div>
                  {isSearchMode
                    ? "За вашим запитом статей не знайдено."
                    : "Популярних статей поки немає."}
                </div>
              )}

              {!loadingHomeContent &&
                popularArticles.map((article) => (
                  <article key={article.id} className="home-article-card">
                    <div className="home-article-card__badges">
                      <span>Open Access</span>
                      <span>Стаття</span>
                    </div>

                    <div className="home-article-card__meta">
                      <p className="home-article-card__author">
                        {article.authorName || "Анонім"}
                      </p>

                      {(article.date || article.createdAt) && (
                        <p className="home-article-card__date">
                          <CalendarDays size={14} />
                          {formatDate(article.date || article.createdAt)}
                        </p>
                      )}
                    </div>

                    <h3>{article.title}</h3>

                    <p className="home-article-card__excerpt">
                      {article.description}
                    </p>

                    <Link
                      to={`/articles/${article.id}`}
                      className="home-article-card__button"
                    >
                      Читати детальніше
                    </Link>
                  </article>
                ))}
            </div>
          </div>
        </main>

        <aside className="home-news">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Останні новини / оголошення</h2>
            </div>

            <div className="home-news-list">
              {loadingHomeContent && <div>Завантаження новин...</div>}

              {!loadingHomeContent && newsItems.length === 0 && (
                <div>Новин поки немає.</div>
              )}

              {!loadingHomeContent &&
                newsItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/home-content/${item.id}`}
                    className="home-news-card"
                  >
                   <p>{item.title}</p>
                    <span>{formatDate(item.date || item.createdAt)}</span>
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}