import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  Send,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getVenueById,
  type VenueDetails,
} from "../features/venues/venues.api";
import "../styles/journal-details.css";

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function JournalDetailsPage() {
  const { id } = useParams();

  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVenue() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const data = await getVenueById(id);
        setVenue(data.venue);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити журнал.");
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id]);

  if (loading) {
    return <div className="journal-details__state">Завантаження журналу...</div>;
  }

  if (error) {
    return <div className="journal-details__state">{error}</div>;
  }

  if (!venue) {
    return <div className="journal-details__state">Журнал не знайдено.</div>;
  }

  return (
    <section className="journal-details">
      <div className="journal-details__container">
        <Link to="/journals" className="journal-details__back">
          <ArrowLeft size={17} />
          До каталогу журналів
        </Link>

        <div className="journal-details__hero">
          <div className="journal-details__main">
            <span className="journal-details__badge">
              <BookOpen size={16} />
              Науковий журнал
            </span>

            <h1>{venue.title}</h1>

            <p>{venue.description}</p>

            <div className="journal-details__meta">
              <span>
                <CalendarDays size={15} />
                Дедлайн: {formatDate(venue.deadline)}
              </span>

              <span>
                <FileText size={15} />
                Статей: {venue.stats.publishedArticles}
              </span>

              <span>
                <BookOpen size={15} />
                Випусків: {venue.stats.publishedIssues}
              </span>
            </div>

            <div className="journal-details__actions">
              <Link to="/author/submit" className="journal-details__submit">
                <Send size={16} />
                Подати статтю
              </Link>

              <Link to="/issues" className="journal-details__secondary">
                Переглянути випуски
              </Link>
            </div>
          </div>

          <aside className="journal-details__rating">
            <div className="journal-details__rating-circle">
              <Star size={24} />
              <strong>{venue.rating}</strong>
            </div>

            <h2>Рейтинговий показник</h2>

            <p>
              Показник формується на основі кількості опублікованих статей та
              випусків журналу в межах платформи.
            </p>
          </aside>
        </div>

        <div className="journal-details__slider">
          <div className="journal-details__slider-header">
            <h2>Останні випуски журналу</h2>
            <Link to="/issues">Усі випуски</Link>
          </div>

          {venue.publishedIssues.length === 0 ? (
            <div className="journal-details__empty">
              У цього журналу поки немає опублікованих випусків.
            </div>
          ) : (
            <div className="journal-details__issues">
              {venue.publishedIssues.map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="journal-issue-slide"
                >
                  <span>Випуск</span>

                  <h3>{issue.title}</h3>

                  <p>{issue.description || "Опис випуску не додано."}</p>

                  <div>
                    {issue.year && <small>Рік: {issue.year}</small>}
                    {issue.volume && <small>Том: {issue.volume}</small>}
                    {issue.issueNumber && <small>№ {issue.issueNumber}</small>}
                    <small>Статей: {issue.submissions.length}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}