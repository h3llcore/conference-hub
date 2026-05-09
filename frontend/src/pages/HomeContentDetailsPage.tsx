import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Newspaper } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  apiGetHomeContentById,
  type HomeContent,
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

function getTypeLabel(type: string) {
  if (type === "NEWS") return "Новина / оголошення";
  if (type === "JOURNAL") return "Науковий журнал";
  return "Контент";
}

export default function HomeContentDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const data = await apiGetHomeContentById(id);
        setItem(data.item);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити матеріал.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [id]);

  if (loading) {
    return <div className="content-details__state">Завантаження...</div>;
  }

  if (error) {
    return <div className="content-details__state">{error}</div>;
  }

  if (!item) {
    return <div className="content-details__state">Матеріал не знайдено.</div>;
  }

  return (
    <section className="content-details">
      <div className="content-details__container">
        <Link to="/" className="content-details__back">
          ← На головну
        </Link>

        <article className="content-details__card">
          <div className="content-details__badge">
            {item.type === "JOURNAL" ? (
              <BookOpen size={16} />
            ) : (
              <Newspaper size={16} />
            )}

            {getTypeLabel(item.type)}
          </div>

          <h1>{item.title}</h1>

          <div className="content-details__meta">
            <span>Дата: {formatDate(item.date || item.createdAt)}</span>

            {item.rating && <span>Рейтинг: {item.rating}</span>}
          </div>

          <div className="content-details__block">
            <h2>Опис</h2>
            <p>{item.description}</p>
          </div>

          {item.linkUrl && (
            <a
              className="content-details__external"
              href={item.linkUrl}
              target={item.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noreferrer"
            >
              Перейти за посиланням <ExternalLink size={15} />
            </a>
          )}
        </article>
      </div>
    </section>
  );
}