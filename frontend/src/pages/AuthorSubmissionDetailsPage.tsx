import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSubmissionById } from "../features/submissions/submissions.api";
import "../styles/author-submit.css";

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
  status: string;
  createdAt: string;
};

function formatStatus(status: string) {
  if (status === "ACCEPTED") return "Прийнято";
  if (status === "UNDER_REVIEW") return "На рецензуванні";
  if (status === "SUBMITTED") return "Подано";
  if (status === "REJECTED") return "Відхилено";
  return "Чернетка";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function AuthorSubmissionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
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

        const data = await getSubmissionById(id);

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

  return (
    <section className="author-submit">
      <div className="author-submit__hero">
        <div className="author-submit__hero-content">
          <p className="author-submit__eyebrow">Перегляд подання</p>
          <h1 className="author-submit__title">Деталі наукової роботи</h1>
          <p className="author-submit__description">
            Перегляньте повну інформацію про подану роботу та, за потреби, перейдіть до редагування.
          </p>
        </div>
      </div>

      <div className="author-submit__layout">
        <main className="author-submit__main">
          <div className="author-submit__card">
            {loading && <div className="form-success">Завантаження...</div>}
            {!loading && error && <div className="form-error">{error}</div>}

            {!loading && !error && submission && (
              <>
                <div className="author-submit__card-header">
                  <h2>{submission.title}</h2>
                  <p>Статус: {formatStatus(submission.status)}</p>
                </div>

                <div className="author-submit__field">
                  <label>Тип подання</label>
                  <input
                    value={
                      submission.venueType === "JOURNAL"
                        ? "Науковий журнал"
                        : "Конференція"
                    }
                    readOnly
                  />
                </div>

                <div className="author-submit__field">
                  <label>Журнал / конференція</label>
                  <input value={submission.venue} readOnly />
                </div>

                <div className="author-submit__field">
                  <label>Анотація</label>
                  <textarea value={submission.abstract} readOnly rows={6} />
                </div>

                <div className="author-submit__field">
                  <label>Ключові слова</label>
                  <input value={submission.keywords} readOnly />
                </div>

                <div className="author-submit__field">
                  <label>Співавтори</label>
                  <input value={submission.coAuthors || "—"} readOnly />
                </div>

                <div className="author-submit__field">
                  <label>Примітки</label>
                  <textarea value={submission.notes || "—"} readOnly rows={4} />
                </div>

                <div className="author-submit__field">
                  <label>Файл</label>
                  <input value={submission.fileName || "Файл не вказано"} readOnly />
                </div>

                <div className="author-submit__field">
                  <label>Дата подання</label>
                  <input value={formatDate(submission.createdAt)} readOnly />
                </div>

                <div className="author-submit__actions">
                  <button
                    type="button"
                    className="author-submit__button author-submit__button--secondary"
                    onClick={() => navigate("/author")}
                  >
                    Назад
                  </button>

                  <Link
                    to={`/author/edit/${submission.id}`}
                    className="author-submit__button author-submit__button--primary"> Редагувати
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}