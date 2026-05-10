import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Tag,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  apiGetPublishedArticleById,
  type PublishedArticle,
} from "../features/home/home.api";
import "../styles/content-details.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getVenueTypeLabel(type: string) {
  if (type === "JOURNAL") return "Науковий журнал";
  if (type === "CONFERENCE") return "Конференція";
  return type;
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

  const keywords = useMemo(() => {
    if (!article?.keywords) return [];

    return article.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [article]);

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

  const downloadFileUrl = article.fileName
    ? `${API_URL.replace(/\/$/, "")}/api/submissions/file/${encodeURIComponent(
        article.fileName,
      )}/download`
    : "";

  const viewFileUrl = article.fileName
    ? `${API_URL.replace(
        /\/$/,
        "",
      )}/api/submissions/public-file/${encodeURIComponent(article.fileName)}/view`
    : "";

  return (
    <section className="content-details">
      <div className="content-details__container">
        <Link to="/" className="content-details__back">
          <ArrowLeft size={17} />
          На головну
        </Link>

        <article className="content-details__card">
          <div className="content-details__top">
            <div className="content-details__badge">
              <FileText size={16} />
              Опублікована стаття
            </div>

            <div className="content-details__status">Open Access</div>
          </div>

          <h1>{article.title}</h1>

          <div className="content-details__meta">
            <span>
              <CalendarDays size={15} />
              Дата публікації: {formatDate(article.finalDecisionAt)}
            </span>

            <span>{getVenueTypeLabel(article.venueType)}</span>

            <span>{article.venue}</span>

            <span>Версія: {article.version}</span>
          </div>

          <div className="content-details__author">
            <div className="content-details__author-icon">
              <UserRound size={20} />
            </div>

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
                    ORCID
                    {article.author.orcidVerified ? " підтверджено" : ""}
                    <ExternalLink size={13} />
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

          {keywords.length > 0 && (
            <div className="content-details__block">
              <h2>Ключові слова</h2>

              <div className="content-details__tags">
                {keywords.map((keyword) => (
                  <span key={keyword}>
                    <Tag size={13} />
                    {keyword}
                  </span>
                ))}
              </div>
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
              <h2>Примітки автора</h2>
              <p>{article.notes}</p>
            </div>
          )}

          <div className="content-details__actions">
            {article.fileName ? (
              <>
                <a
                  href={viewFileUrl}
                  className="content-details__download"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={17} />
                  Переглянути файл
                </a>

                <a
                  href={downloadFileUrl}
                  className="content-details__secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={17} />
                  Завантажити PDF
                </a>
              </>
            ) : (
              <span className="content-details__file-empty">
                Файл статті не прикріплено
              </span>
            )}

            <Link to="/" className="content-details__secondary">
              Повернутися на головну
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}