import {
  CalendarDays,
  Clock3,
  FileText,
  Megaphone,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getMySubmissions } from "../features/submissions/submissions.api";
import { getVenues } from "../features/venues/venues.api";
import { apiGetHomeContent, type HomeContent } from "../features/home/home.api";
import "../styles/author-dashboard.css";

type Submission = {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  venueType: "JOURNAL" | "CONFERENCE";
  venue: string;
  coAuthors?: string | null;
  notes?: string | null;
  fileName?: string | null;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "REVISION_REQUIRED"
    | "RESUBMITTED"
    | "ACCEPTED"
    | "REJECTED"
    | "PUBLISHED";
  version?: number;
  createdAt: string;
};

type DeadlineVenue = {
  id: string;
  title: string;
  description?: string;
  type: "JOURNAL" | "CONFERENCE";
  deadline?: string;
};

function formatStatus(status: string) {
  if (status === "DRAFT") return "Чернетка";
  if (status === "SUBMITTED") return "Подано";
  if (status === "UNDER_REVIEW") return "На рецензуванні";
  if (status === "REVISION_REQUIRED") return "Потребує доопрацювання";
  if (status === "RESUBMITTED") return "Повторно подано";
  if (status === "ACCEPTED") return "Прийнято";
  if (status === "REJECTED") return "Відхилено";
  if (status === "PUBLISHED") return "Опубліковано";
  return status;
}

function getStatusClass(status: string) {
  if (status === "ACCEPTED" || status === "PUBLISHED") {
    return "author-dashboard__status author-dashboard__status--accepted";
  }

  if (
    status === "UNDER_REVIEW" ||
    status === "SUBMITTED" ||
    status === "RESUBMITTED"
  ) {
    return "author-dashboard__status author-dashboard__status--review";
  }

  if (status === "REJECTED") {
    return "author-dashboard__status author-dashboard__status--rejected";
  }

  if (status === "REVISION_REQUIRED") {
    return "author-dashboard__status author-dashboard__status--revision";
  }

  return "author-dashboard__status author-dashboard__status--draft";
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Не вказано";

  return new Date(dateString).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getVenueTypeLabel(type: "JOURNAL" | "CONFERENCE") {
  return type === "JOURNAL" ? "Журнал" : "Конференція";
}

function getVenueLink(venue: DeadlineVenue) {
  if (venue.type === "JOURNAL") {
    return `/journals/${venue.id}`;
  }

  return "/programs";
}

export default function AuthorDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineVenue[]>([]);
  const [announcements, setAnnouncements] = useState<HomeContent[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions(showLoader = false) {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const data = await getMySubmissions();

        if (isMounted) {
          setSubmissions(data.submissions || []);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Не вдалося завантажити подання.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSubmissions(true);

    const intervalId = window.setInterval(() => {
      loadSubmissions(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSidebarData() {
      try {
        setLoadingSidebar(true);

        const [venuesData, homeData] = await Promise.all([
          getVenues({
            limit: 20,
            sort: "newest",
          }),
          apiGetHomeContent(),
        ]);

        if (!isMounted) return;

        const now = new Date();

        const upcomingDeadlines = (venuesData.venues || [])
          .filter((venue: DeadlineVenue) => {
            if (!venue.deadline) return false;

            const deadlineDate = new Date(venue.deadline);
            return deadlineDate >= now;
          })
          .sort(
            (a: DeadlineVenue, b: DeadlineVenue) =>
              new Date(a.deadline || "").getTime() -
              new Date(b.deadline || "").getTime(),
          )
          .slice(0, 3);

        setDeadlines(upcomingDeadlines);
        setAnnouncements((homeData.news || []).slice(0, 3));
      } catch (e) {
        console.error(e);

        if (isMounted) {
          setDeadlines([]);
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSidebar(false);
        }
      }
    }

    loadSidebarData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = submissions.length;

    const activeReview = submissions.filter(
      (item) =>
        item.status === "UNDER_REVIEW" ||
        item.status === "SUBMITTED" ||
        item.status === "RESUBMITTED" ||
        item.status === "REVISION_REQUIRED",
    ).length;

    const drafts = submissions.filter((item) => item.status === "DRAFT").length;

    return { total, activeReview, drafts };
  }, [submissions]);

  return (
    <section className="author-dashboard">
      <div className="author-dashboard__hero">
        <div className="author-dashboard__hero-content">
          <p className="author-dashboard__eyebrow">Кабінет автора</p>

          <h1 className="author-dashboard__title">
            Вітаємо у вашому робочому просторі
          </h1>

          <p className="author-dashboard__description">
            Тут ви можете відстежувати свої подання, переглядати дедлайни,
            працювати з чернетками та швидко подавати нові наукові матеріали.
          </p>

          <div className="author-dashboard__hero-actions">
            <Link
              to="/author/submit"
              className="author-dashboard__hero-button author-dashboard__hero-button--primary"
            >
              <Upload size={16} />
              <span>Подати нову роботу</span>
            </Link>

            <Link
              to="/journals"
              className="author-dashboard__hero-button author-dashboard__hero-button--secondary"
            >
              <Search size={16} />
              <span>Знайти журнал для подання</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="author-dashboard__stats">
        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <FileText size={20} />
          </div>

          <div>
            <p className="author-dashboard__stat-value">{stats.total}</p>
            <p className="author-dashboard__stat-label">Усього подань</p>
          </div>
        </article>

        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <p className="author-dashboard__stat-value">{stats.activeReview}</p>
            <p className="author-dashboard__stat-label">Активних перевірок</p>
          </div>
        </article>

        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="author-dashboard__stat-value">{stats.drafts}</p>
            <p className="author-dashboard__stat-label">Чернеток</p>
          </div>
        </article>
      </div>

      <div className="author-dashboard__layout">
        <main className="author-dashboard__main">
          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Мої подання</h2>

              <Link to="/author/submit" className="author-dashboard__add-link">
                <Plus size={16} />
                <span>Нове подання</span>
              </Link>
            </div>

            {loading && (
              <div className="author-dashboard__state">
                Завантаження подань...
              </div>
            )}

            {!loading && error && (
              <div className="author-dashboard__state author-dashboard__state--error">
                {error}
              </div>
            )}

            {!loading && !error && submissions.length === 0 && (
              <div className="author-dashboard__state">
                У вас поки немає жодного подання.
              </div>
            )}

            {!loading && !error && submissions.length > 0 && (
              <div className="author-dashboard__submissions">
                {submissions.map((item) => (
                  <article
                    key={item.id}
                    className="author-dashboard__submission-card"
                  >
                    <div className="author-dashboard__submission-top">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.venue}</p>
                      </div>

                      <span className={getStatusClass(item.status)}>
                        {formatStatus(item.status)}
                      </span>
                    </div>

                    <div className="author-dashboard__submission-meta">
                      <span>
                        Тип:{" "}
                        {item.venueType === "JOURNAL"
                          ? "Науковий журнал"
                          : "Конференція"}
                      </span>
                      <span>Версія: {item.version || 1}</span>
                      <span>Дата подання: {formatDate(item.createdAt)}</span>
                      {item.fileName && <span>Файл: {item.fileName}</span>}
                    </div>

                    <div className="author-dashboard__submission-bottom">
                      <span>Ключові слова: {item.keywords}</span>

                      <div className="author-dashboard__submission-actions">
                        <Link to={`/author/submission/${item.id}`}>
                          Переглянути
                        </Link>

                        {item.status === "REVISION_REQUIRED" ? (
                          <Link to={`/author/edit/${item.id}`}>
                            Подати повторно
                          </Link>
                        ) : (
                          <Link to={`/author/edit/${item.id}`}>
                            Редагувати
                          </Link>
                        )}

                        <Link to={`/author/reviews/${item.id}`}>Рецензії</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className="author-dashboard__sidebar">
          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Найближчі дедлайни</h2>
            </div>

            <div className="author-dashboard__deadlines">
              {loadingSidebar && (
                <div className="author-dashboard__state">
                  Завантаження дедлайнів...
                </div>
              )}

              {!loadingSidebar && deadlines.length === 0 && (
                <div className="author-dashboard__state">
                  Найближчих дедлайнів поки немає.
                </div>
              )}

              {!loadingSidebar &&
                deadlines.map((deadline) => (
                  <Link
                    key={deadline.id}
                    to={getVenueLink(deadline)}
                    className="author-dashboard__deadline-card"
                  >
                    <div className="author-dashboard__deadline-type">
                      <CalendarDays size={14} />
                      {getVenueTypeLabel(deadline.type)}
                    </div>

                    <h3>{deadline.title}</h3>

                    <span>{formatDate(deadline.deadline)}</span>
                  </Link>
                ))}
            </div>
          </div>

          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Оголошення</h2>
            </div>

            <div className="author-dashboard__announcements">
              {loadingSidebar && (
                <div className="author-dashboard__state">
                  Завантаження оголошень...
                </div>
              )}

              {!loadingSidebar && announcements.length === 0 && (
                <div className="author-dashboard__state">
                  Оголошень поки немає.
                </div>
              )}

              {!loadingSidebar &&
                announcements.map((item) => (
                  <Link
                    key={item.id}
                    to={`/home-content/${item.id}`}
                    className="author-dashboard__announcement-card"
                  >
                    <div className="author-dashboard__announcement-type">
                      <Megaphone size={14} />
                      Оголошення
                    </div>

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