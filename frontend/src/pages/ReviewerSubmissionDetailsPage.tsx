import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getReviewerSubmissionById,
  updateReviewerSubmissionStatus,
} from "../features/submissions/submissions.api";
import "../styles/reviewer-submission-details.css";

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
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    country: string;
  };
};

function formatStatus(status: ReviewerSubmission["status"]) {
  if (status === "UNDER_REVIEW") return "На рецензуванні";
  if (status === "ACCEPTED") return "Прийнято";
  if (status === "REJECTED") return "Відхилено";
  return "Подано";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function ReviewerSubmissionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<ReviewerSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmission() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Невірний ідентифікатор подання.");
        }

        const data = await getReviewerSubmissionById(id);

        if (isMounted) {
          setSubmission(data.submission);
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

    loadSubmission();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleStatusChange(status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED") {
    if (!submission) return;

    try {
      setActionLoading(true);
      setError("");

      const data = await updateReviewerSubmissionStatus(submission.id, status);
      setSubmission(data.submission);
    } catch (e: any) {
      setError(e.message || "Не вдалося оновити статус.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="reviewer-details">
      <div className="reviewer-details__hero">
        <p className="reviewer-details__eyebrow">Детальний перегляд</p>
        <h1 className="reviewer-details__title">Подання для рецензування</h1>
        <p className="reviewer-details__description">
          Перегляньте повну інформацію про матеріал, оцініть його та змініть статус.
        </p>
      </div>

      <div className="reviewer-details__card">
        {loading && <div className="reviewer-details__state">Завантаження...</div>}
        {!loading && error && (
          <div className="reviewer-details__state reviewer-details__state--error">{error}</div>
        )}

        {!loading && !error && submission && (
          <>
            <div className="reviewer-details__header">
              <div>
                <h2>{submission.title}</h2>
                <p>Статус: {formatStatus(submission.status)}</p>
              </div>
            </div>

            <div className="reviewer-details__field">
              <label>Тип подання</label>
              <input
                value={submission.venueType === "JOURNAL" ? "Науковий журнал" : "Конференція"}
                readOnly
              />
            </div>

            <div className="reviewer-details__field">
              <label>Журнал / конференція</label>
              <input value={submission.venue} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Автор</label>
              <input
                value={`${submission.author.firstName} ${submission.author.lastName}`}
                readOnly
              />
            </div>

            <div className="reviewer-details__field">
              <label>Email автора</label>
              <input value={submission.author.email} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Установа</label>
              <input value={submission.author.institution} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Країна</label>
              <input value={submission.author.country} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Анотація</label>
              <textarea value={submission.abstract} readOnly rows={6} />
            </div>

            <div className="reviewer-details__field">
              <label>Ключові слова</label>
              <input value={submission.keywords} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Співавтори</label>
              <input value={submission.coAuthors || "—"} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Примітки</label>
              <textarea value={submission.notes || "—"} readOnly rows={4} />
            </div>

            <div className="reviewer-details__field">
              <label>Файл</label>
              <input value={submission.fileName || "Файл не вказано"} readOnly />
            </div>

            <div className="reviewer-details__field">
              <label>Дата подання</label>
              <input value={formatDate(submission.createdAt)} readOnly />
            </div>

            <div className="reviewer-details__actions">
              <button
                type="button"
                className="reviewer-details__button reviewer-details__button--secondary"
                onClick={() => navigate("/reviewer")}
              >
                Назад
              </button>

              <button
                type="button"
                className="reviewer-details__button reviewer-details__button--review"
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                disabled={actionLoading}
              >
                На рецензування
              </button>

              <button
                type="button"
                className="reviewer-details__button reviewer-details__button--accept"
                onClick={() => handleStatusChange("ACCEPTED")}
                disabled={actionLoading}
              >
                Прийняти
              </button>

              <button
                type="button"
                className="reviewer-details__button reviewer-details__button--reject"
                onClick={() => handleStatusChange("REJECTED")}
                disabled={actionLoading}
              >
                Відхилити
              </button>
            </div>

            <p className="reviewer-details__note">
              Зараз система показує лише назву прикріпленого файлу. Реальне відкриття або
              завантаження файлу можна додати після впровадження повного файлового збереження на
              сервері.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
