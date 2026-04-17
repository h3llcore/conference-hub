import {
  CalendarDays,
  Clock3,
  FileText,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getMySubmissions } from "../features/submissions/submissions.api";
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
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};

const deadlines = [
  {
    id: 1,
    title: "Подання статей до конференції AI in Education",
    date: "20.04.2026",
  },
  {
    id: 2,
    title: "Фінальне завантаження матеріалів до журналу IT Research",
    date: "25.04.2026",
  },
];

const announcements = [
  {
    id: 1,
    text: "Оновлено вимоги до оформлення статей для міжнародних конференцій.",
  },
  {
    id: 2,
    text: "Доступний новий шаблон титульної сторінки для подань.",
  },
];

function formatStatus(status: Submission["status"]) {
  if (status === "ACCEPTED") return "Прийнято";
  if (status === "UNDER_REVIEW") return "На рецензуванні";
  if (status === "SUBMITTED") return "Подано";
  if (status === "REJECTED") return "Відхилено";
  return "Чернетка";
}

function getStatusClass(status: Submission["status"]) {
  if (status === "ACCEPTED") {
    return "author-dashboard__status author-dashboard__status--accepted";
  }

  if (status === "UNDER_REVIEW" || status === "SUBMITTED") {
    return "author-dashboard__status author-dashboard__status--review";
  }

  if (status === "REJECTED") {
    return "author-dashboard__status author-dashboard__status--rejected";
  }

  return "author-dashboard__status author-dashboard__status--draft";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function AuthorDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      try {
        setLoading(true);
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

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = submissions.length;
    const activeReview = submissions.filter(
      (item) => item.status === "UNDER_REVIEW" || item.status === "SUBMITTED",
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

            <button
              type="button"
              className="author-dashboard__hero-button author-dashboard__hero-button--secondary"
            >
              <Search size={16} />
              <span>Пошук журналів</span>
            </button>
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
              <Link
                to="/author/submit"
                className="author-dashboard__add-link"
              >
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
                      <span>Дата подання: {formatDate(item.createdAt)}</span>
                      {item.fileName && <span>Файл: {item.fileName}</span>}
                    </div>

                    <div className="author-dashboard__submission-bottom">
                      <span>Ключові слова: {item.keywords}</span>

                      <div className="author-dashboard__submission-actions">
                        <button type="button">Переглянути</button>
                        <button type="button">Редагувати</button>
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
              {deadlines.map((deadline) => (
                <article
                  key={deadline.id}
                  className="author-dashboard__deadline-card"
                >
                  <h3>{deadline.title}</h3>
                  <span>{deadline.date}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Оголошення</h2>
            </div>

            <div className="author-dashboard__announcements">
              {announcements.map((item) => (
                <article
                  key={item.id}
                  className="author-dashboard__announcement-card"
                >
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}