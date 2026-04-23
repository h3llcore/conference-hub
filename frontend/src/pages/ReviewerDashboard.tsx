import {
  CheckCircle2,
  Clock3,
  FileText,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getMyReviewerAssignments } from "../features/assignments/assignments.api";
import "../styles/reviewer-dashboard.css";

type ReviewerSubmission = {
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
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "REVISION_REQUIRED"
    | "RESUBMITTED"
    | "ACCEPTED"
    | "REJECTED";
  version?: number;
  currentRound?: number;
  createdAt: string;
};

type ReviewerAssignment = {
  id: string;
  assignedAt: string;
  updatedAt: string;
  round: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  submission: ReviewerSubmission;
};

function formatAssignmentStatus(status: ReviewerAssignment["status"]) {
  if (status === "ASSIGNED") return "Призначено";
  if (status === "IN_PROGRESS") return "У роботі";
  if (status === "COMPLETED") return "Завершено";
  return status;
}

function getAssignmentStatusClass(status: ReviewerAssignment["status"]) {
  if (status === "ASSIGNED") {
    return "reviewer-dashboard__status reviewer-dashboard__status--submitted";
  }

  if (status === "IN_PROGRESS") {
    return "reviewer-dashboard__status reviewer-dashboard__status--review";
  }

  return "reviewer-dashboard__status reviewer-dashboard__status--accepted";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function ReviewerDashboard() {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReviewerAssignments();

        if (isMounted) {
          setAssignments(data.assignments || []);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Не вдалося завантажити призначення.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return assignments;

    return assignments.filter((item) => {
      const title = item.submission.title.toLowerCase();
      const venue = item.submission.venue.toLowerCase();
      const keywords = item.submission.keywords.toLowerCase();

      return (
        title.includes(query) ||
        venue.includes(query) ||
        keywords.includes(query)
      );
    });
  }, [assignments, search]);

  const stats = useMemo(() => {
    return {
      total: assignments.length,
      assigned: assignments.filter((item) => item.status === "ASSIGNED").length,
      inProgress: assignments.filter((item) => item.status === "IN_PROGRESS")
        .length,
      completed: assignments.filter((item) => item.status === "COMPLETED").length,
    };
  }, [assignments]);

  return (
    <section className="reviewer-dashboard">
      <div className="reviewer-dashboard__hero">
        <div className="reviewer-dashboard__hero-content">
          <p className="reviewer-dashboard__eyebrow">Кабінет рецензента</p>
          <h1 className="reviewer-dashboard__title">
            Перегляд та оцінювання подань
          </h1>
          <p className="reviewer-dashboard__description">
            Переглядайте призначені вам статті, беріть їх у роботу та заповнюйте
            форму рецензії.
          </p>
        </div>
      </div>

      <div className="reviewer-dashboard__stats">
        <article className="reviewer-dashboard__stat-card">
          <div className="reviewer-dashboard__stat-icon">
            <FileText size={20} />
          </div>
          <div>
            <p className="reviewer-dashboard__stat-value">{stats.total}</p>
            <p className="reviewer-dashboard__stat-label">Призначено статей</p>
          </div>
        </article>

        <article className="reviewer-dashboard__stat-card">
          <div className="reviewer-dashboard__stat-icon">
            <Clock3 size={20} />
          </div>
          <div>
            <p className="reviewer-dashboard__stat-value">{stats.assigned}</p>
            <p className="reviewer-dashboard__stat-label">Нових призначень</p>
          </div>
        </article>

        <article className="reviewer-dashboard__stat-card">
          <div className="reviewer-dashboard__stat-icon">
            <Search size={20} />
          </div>
          <div>
            <p className="reviewer-dashboard__stat-value">{stats.inProgress}</p>
            <p className="reviewer-dashboard__stat-label">У роботі</p>
          </div>
        </article>

        <article className="reviewer-dashboard__stat-card">
          <div className="reviewer-dashboard__stat-icon">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="reviewer-dashboard__stat-value">{stats.completed}</p>
            <p className="reviewer-dashboard__stat-label">Завершено</p>
          </div>
        </article>
      </div>

      <div className="reviewer-dashboard__toolbar">
        <div className="reviewer-dashboard__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Пошук за назвою, журналом або ключовими словами"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="reviewer-dashboard__state reviewer-dashboard__state--error">
          {error}
        </div>
      )}

      {!loading && filteredAssignments.length === 0 && (
        <div className="reviewer-dashboard__state">
          Призначень для перегляду поки немає.
        </div>
      )}

      <div className="reviewer-dashboard__layout reviewer-dashboard__layout--single">
        <main className="reviewer-dashboard__main">
          {loading && (
            <div className="reviewer-dashboard__state">
              Завантаження призначень...
            </div>
          )}

          {!loading && filteredAssignments.length > 0 && (
            <div className="reviewer-dashboard__list">
              {filteredAssignments.map((item) => (
                <article key={item.id} className="reviewer-dashboard__card">
                  <div className="reviewer-dashboard__card-top">
                    <div>
                      <h3>{item.submission.title}</h3>
                      <p>
                        {item.submission.venueType === "JOURNAL"
                          ? "Науковий журнал"
                          : "Конференція"}{" "}
                        • {item.submission.venue}
                      </p>
                    </div>

                    <span className={getAssignmentStatusClass(item.status)}>
                      {formatAssignmentStatus(item.status)}
                    </span>
                  </div>

                  <div className="reviewer-dashboard__meta">
                    <span>Версія: {item.submission.version || 1}</span>
                    <span>Раунд: {item.round}</span>
                    <span>
                      Дата подання: {formatDate(item.submission.createdAt)}
                    </span>
                    {item.submission.fileName && (
                      <span>Файл: {item.submission.fileName}</span>
                    )}
                  </div>

                  <p className="reviewer-dashboard__excerpt">
                    {item.submission.abstract}
                  </p>

                  <div className="reviewer-dashboard__actions">
                    <Link
                      to={`/reviewer/review/${item.submission.id}`}
                      className="reviewer-dashboard__link-button"
                    >
                      Переглянути / рецензувати
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}