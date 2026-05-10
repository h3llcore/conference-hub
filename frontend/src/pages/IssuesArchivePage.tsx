import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Eye,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getPublicationIssues,
  type PublicationIssue,
  type PublicationIssueType,
} from "../features/publication-issues/publication-issues.api";
import "../styles/issues-archive.css";

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type: PublicationIssueType) {
  return type === "JOURNAL"
    ? "Випуск журналу"
    : "Збірник конференції";
}

export default function IssuesArchivePage() {
  const [issues, setIssues] = useState<PublicationIssue[]>([]);

  const [typeFilter, setTypeFilter] = useState<
    "ALL" | PublicationIssueType
  >("ALL");

  const [search, setSearch] = useState("");

  const [yearFilter, setYearFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIssues() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicationIssues();

        setIssues(data.issues || []);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити архів.");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, []);

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(
        issues
          .map((issue) => issue.year)
          .filter(Boolean),
      ),
    );

    return uniqueYears.sort((a, b) => Number(b) - Number(a));
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issue.status !== "PUBLISHED") {
        return false;
      }

      if (typeFilter !== "ALL" && issue.type !== typeFilter) {
        return false;
      }

      if (
        yearFilter !== "ALL" &&
        String(issue.year) !== yearFilter
      ) {
        return false;
      }

      const normalizedSearch = search.trim().toLowerCase();

      if (normalizedSearch.length > 0) {
        const target =
          `${issue.title} ${issue.description || ""} ${
            issue.venue?.title || ""
          }`.toLowerCase();

        if (!target.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [issues, typeFilter, yearFilter, search]);

  return (
    <section className="issues-archive">
      <div className="issues-archive__container">
        <div className="issues-archive__hero">
          <p>Цифровий архів</p>

          <h1>
            Архів випусків журналів та збірників конференцій
          </h1>

          <span>
            Переглядайте опубліковані випуски, збірники
            матеріалів та статті, що увійшли до них.
          </span>
        </div>

        <div className="issues-archive__toolbar">
          <div className="issues-archive__search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Пошук за назвою, описом або журналом..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="issues-archive__year-filter">
            <SlidersHorizontal size={16} />

            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(event.target.value)
              }
            >
              <option value="ALL">Усі роки</option>

              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="issues-archive__filters">
          <button
            type="button"
            className={typeFilter === "ALL" ? "is-active" : ""}
            onClick={() => setTypeFilter("ALL")}
          >
            Усі
          </button>

          <button
            type="button"
            className={
              typeFilter === "JOURNAL" ? "is-active" : ""
            }
            onClick={() => setTypeFilter("JOURNAL")}
          >
            Випуски журналів
          </button>

          <button
            type="button"
            className={
              typeFilter === "CONFERENCE"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setTypeFilter("CONFERENCE")
            }
          >
            Збірники конференцій
          </button>
        </div>

        {error && (
          <div className="issues-archive__alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="issues-archive__empty">
            Завантаження архіву...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="issues-archive__empty">
            За вашим запитом нічого не знайдено.
          </div>
        ) : (
          <div className="issues-archive__list">
            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className="issues-archive-card"
              >
                <div className="issues-archive-card__top">
                  <span className="issues-archive-card__type">
                    <BookOpen size={15} />
                    {getTypeLabel(issue.type)}
                  </span>

                  <span className="issues-archive-card__date">
                    <CalendarDays size={14} />
                    {formatDate(issue.publishedAt)}
                  </span>
                </div>

                <h2>{issue.title}</h2>

                <p>
                  {issue.description ||
                    "Опис випуску не додано."}
                </p>

                <div className="issues-archive-card__meta">
                  <span>
                    {issue.venue?.title ||
                      "Без майданчика"}
                  </span>

                  {issue.year && (
                    <span>Рік: {issue.year}</span>
                  )}

                  {issue.volume && (
                    <span>Том: {issue.volume}</span>
                  )}

                  {issue.issueNumber && (
                    <span>№ {issue.issueNumber}</span>
                  )}

                  <span>
                    Статей:{" "}
                    {issue.submissions?.length || 0}
                  </span>
                </div>

                <Link
                  to={`/issues/${issue.id}`}
                  className="issues-archive-card__button"
                >
                  <Eye size={16} />
                  Переглянути
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}