import { useEffect, useState } from "react";
import { ExternalLink, FileText, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  apiGetPublishedArticleById,
  type PublishedArticle,
} from "../features/home/home.api";
import "../styles/content-details.css";

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ArticleDetailsPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<PublishedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const data = await apiGetPublishedArticleById(id);
        setArticle(data.article);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити статтю.");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return <div className="content-details__state">Завантаження статті...</div>;
  }

  if (error) {
    return <div className="content-details__state">{error}</div>;
  }

  if (!article) {
    return <div className="content-details__state">Статтю не знайдено.</div>;
  }

  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`
    : "Анонім";

  return (
    <section className="content-details">
      <div className="content-details__container">
        <Link to="/" className="content-details__back">
          ← На головну
        </Link>

        <article className="content-details__card">
          <div className="content-details__badge">
            <FileText size={16} />
            Опублікована стаття
          </div>

          <h1>{article.title}</h1>

          <div className="content-details__meta">
            <span>Дата публікації: {formatDate(article.finalDecisionAt)}</span>
            <span>
              Тип:{" "}
              {article.venueType === "JOURNAL"
                ? "Науковий журнал"
                : "Конференція"}
            </span>
            <span>Майданчик: {article.venue}</span>
          </div>

          <div className="content-details__author">
            <UserRound size={18} />

            <div>
              <strong>{authorName}</strong>

              {article.author?.institution && (
                <p>{article.author.institution}</p>
              )}

              <div className="content-details__links">
                {article.author?.orcid && (
                  <a
                    href={`https://orcid.org/${article.author.orcid}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ORCID <ExternalLink size={13} />
                  </a>
                )}

                {article.author?.googleScholarUrl && (
                  <a
                    href={article.author.googleScholarUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Scholar <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="content-details__block">
            <h2>Анотація</h2>
            <p>{article.abstract}</p>
          </div>

          {article.keywords && (
            <div className="content-details__block">
              <h2>Ключові слова</h2>
              <p>{article.keywords}</p>
            </div>
          )}

          {article.coAuthors && (
            <div className="content-details__block">
              <h2>Співавтори</h2>
              <p>{article.coAuthors}</p>
            </div>
          )}

          {article.notes && (
            <div className="content-details__block">
              <h2>Примітки</h2>
              <p>{article.notes}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}