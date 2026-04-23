import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthorSubmissionReviews } from "../features/reviews/reviews.api";
import "../styles/author-reviews.css";

type AuthorReview = {
  id: string;
  round: number;
  titleScore: string;
  relevanceScore: string;
  abstractScore: string;
  structureScore: string;
  methodologyScore: string;
  formattingScore: string;
  referencesScore: string;
  overallScore: string;
  comments?: string | null;
  recommendations?: string | null;
  conclusion?: string | null;
  decision: string;
  createdAt: string;
  updatedAt: string;
};

function formatScore(value: string) {
  if (value === "GOOD") return "Добре";
  if (value === "SATISFACTORY") return "Задовільно";
  if (value === "NEEDS_IMPROVEMENT") return "Потребує доопрацювання";
  return "Незадовільно";
}

function formatDecision(value: string) {
  if (value === "ACCEPT") return "Прийняти";
  if (value === "ACCEPT_WITH_REVISIONS") {
    return "Прийняти після доопрацювання";
  }
  return "Відхилити";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function AuthorReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<AuthorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Невірний ідентифікатор подання.");
        }

        const data = await getAuthorSubmissionReviews(id);

        if (isMounted) {
          setReviews(data.reviews || []);
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e.message || "Не вдалося завантажити рецензії.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (b.round !== a.round) return b.round - a.round;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews]);

  return (
    <section className="author-reviews">
      <div className="author-reviews__hero">
        <p className="author-reviews__eyebrow">Анонімні рецензії</p>
        <h1 className="author-reviews__title">Відгуки на вашу статтю</h1>
        <p className="author-reviews__description">
          Тут відображаються рецензії без розкриття особи рецензента.
        </p>
      </div>

      <div className="author-reviews__content">
        {loading && (
          <div className="author-reviews__state">Завантаження рецензій...</div>
        )}

        {!loading && error && (
          <div className="author-reviews__state author-reviews__state--error">
            {error}
          </div>
        )}

        {!loading && !error && sortedReviews.length === 0 && (
          <div className="author-reviews__state">
            Для цього подання рецензій поки немає.
          </div>
        )}

        {!loading && !error && sortedReviews.length > 0 && (
          <div className="author-reviews__list">
            {sortedReviews.map((review) => (
              <article key={review.id} className="author-reviews__card">
                <div className="author-reviews__card-header">
                  <h2>Раунд {review.round}</h2>
                  <span>{formatDate(review.createdAt)}</span>
                </div>

                <div className="author-reviews__grid">
                  <div>
                    <strong>Назва статті:</strong> {formatScore(review.titleScore)}
                  </div>
                  <div>
                    <strong>Актуальність теми:</strong>{" "}
                    {formatScore(review.relevanceScore)}
                  </div>
                  <div>
                    <strong>Якість анотації:</strong>{" "}
                    {formatScore(review.abstractScore)}
                  </div>
                  <div>
                    <strong>Структура:</strong>{" "}
                    {formatScore(review.structureScore)}
                  </div>
                  <div>
                    <strong>Обґрунтованість результатів:</strong>{" "}
                    {formatScore(review.methodologyScore)}
                  </div>
                  <div>
                    <strong>Оформлення:</strong>{" "}
                    {formatScore(review.formattingScore)}
                  </div>
                  <div>
                    <strong>Список літератури:</strong>{" "}
                    {formatScore(review.referencesScore)}
                  </div>
                  <div>
                    <strong>Загальний рівень:</strong>{" "}
                    {formatScore(review.overallScore)}
                  </div>
                </div>

                <div className="author-reviews__block">
                  <strong>Основні зауваження:</strong>
                  <p>{review.comments || "—"}</p>
                </div>

                <div className="author-reviews__block">
                  <strong>Рекомендації автору:</strong>
                  <p>{review.recommendations || "—"}</p>
                </div>

                <div className="author-reviews__block">
                  <strong>Висновок рецензента:</strong>
                  <p>{review.conclusion || "—"}</p>
                </div>

                <div className="author-reviews__decision">
                  Підсумкове рішення: {formatDecision(review.decision)}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="author-reviews__actions">
          <button
            type="button"
            className="author-reviews__button"
            onClick={() => navigate("/author")}
          >
            Назад до кабінету
          </button>
        </div>
      </div>
    </section>
  );
}