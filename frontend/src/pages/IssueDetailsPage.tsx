import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getPublicationIssueById,
  type PublicationIssue,
} from "../features/publication-issues/publication-issues.api";
import "../styles/issue-details.css";

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type: string) {
  return type === "JOURNAL" ? "Випуск журналу" : "Збірник конференції";
}

function getStatusLabel(status: string) {
  if (status === "PUBLISHED") return "Опубліковано";
  if (status === "ARCHIVED") return "В архіві";
  return "Чернетка";
}

export default function IssueDetailsPage() {
  const { id } = useParams();

  const [issue, setIssue] = useState<PublicationIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIssue() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const data = await getPublicationIssueById(id);
        setIssue(data.issue);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити випуск.");
      } finally {
        setLoading(false);
      }
    }

    loadIssue();
  }, [id]);

  if (loading) {
    return <div className="issue-details__state">Завантаження випуску...</div>;
  }

  if (error) {
    return <div className="issue-details__state">{error}</div>;
  }

  if (!issue) {
    return <div className="issue-details__state">Випуск не знайдено.</div>;
  }

  return (
    <section className="issue-details">
      <div className="issue-details__container">
        <Link to="/" className="issue-details__back">
          <ArrowLeft size={17} />
          На головну
        </Link>

        <article className="issue-details__hero">
          <div className="issue-details__top">
            <span className="issue-details__badge">
              <BookOpen size={16} />
              {getTypeLabel(issue.type)}
            </span>

            <span
              className={`issue-details__status issue-details__status--${issue.status.toLowerCase()}`}
            >
              {getStatusLabel(issue.status)}
            </span>
          </div>

          <h1>{issue.title}</h1>

          <p>{issue.description || "Опис випуску або збірника не додано."}</p>

          <div className="issue-details__meta">
            <span>{issue.venue?.title || "Без майданчика"}</span>

            {issue.year && <span>Рік: {issue.year}</span>}

            {issue.volume && <span>Том: {issue.volume}</span>}

            {issue.issueNumber && <span>№ {issue.issueNumber}</span>}

            <span>
              <CalendarDays size={15} />
              Дата публікації: {formatDate(issue.publishedAt)}
            </span>
          </div>
        </article>

        <div className="issue-details__content">
          <div className="issue-details__section-title">
            <FileText size={18} />
            <h2>Статті у випуску</h2>
          </div>

          {issue.submissions.length === 0 ? (
            <div className="issue-details__empty">
              У цьому випуску поки немає статей.
            </div>
          ) : (
            <div className="issue-details__articles">
              {issue.submissions.map((submission) => (
                <article key={submission.id} className="issue-article-card">
                  <div>
                    <h3>{submission.title}</h3>

                    <p>{submission.abstract}</p>

                    <div className="issue-article-card__meta">
                      <span>
                        Автор:{" "}
                        {submission.author
                          ? `${submission.author.firstName} ${submission.author.lastName}`
                          : "Анонім"}
                      </span>

                      {submission.author?.institution && (
                        <span>{submission.author.institution}</span>
                      )}

                      {submission.finalDecisionAt && (
                        <span>{formatDate(submission.finalDecisionAt)}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/articles/${submission.id}`}
                    className="issue-article-card__button"
                  >
                    Відкрити статтю
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}