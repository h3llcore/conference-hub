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

function getScoreClass(value: string) {
  if (value === "GOOD") {
    return "author-reviews__score author-reviews__score--good";
  }

  if (value === "SATISFACTORY") {
    return "author-reviews__score author-reviews__score--satisfactory";
  }

  if (value === "NEEDS_IMPROVEMENT") {
    return "author-reviews__score author-reviews__score--revision";
  }

  return "author-reviews__score author-reviews__score--bad";
}

function formatDecision(value: string) {
  if (value === "ACCEPT") return "Прийняти";
  if (value === "ACCEPT_WITH_REVISIONS") {
    return "Прийняти після доопрацювання";
  }
  return "Відхилити";
}

function getDecisionClass(value: string) {
  if (value === "ACCEPT") {
    return "author-reviews__decision author-reviews__decision--accept";
  }

  if (value === "ACCEPT_WITH_REVISIONS") {
    return "author-reviews__decision author-reviews__decision--revision";
  }

  return "author-reviews__decision author-reviews__decision--reject";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="author-reviews__score-row">
      <strong>{label}</strong>
      <span className={getScoreClass(value)}>{formatScore(value)}</span>
    </div>
  );
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
                  <div>
                    <h2>Раунд {review.round}</h2>
                    <p>Дата рецензії: {formatDate(review.createdAt)}</p>
                  </div>

                  <div className={getDecisionClass(review.decision)}>
                    {formatDecision(review.decision)}
                  </div>
                </div>

                <div className="author-reviews__section">
                  <h3>Оцінювання за критеріями</h3>

                  <div className="author-reviews__grid">
                    <ScoreRow label="Назва статті" value={review.titleScore} />
                    <ScoreRow
                      label="Актуальність теми"
                      value={review.relevanceScore}
                    />
                    <ScoreRow
                      label="Якість анотації"
                      value={review.abstractScore}
                    />
                    <ScoreRow
                      label="Структура"
                      value={review.structureScore}
                    />
                    <ScoreRow
                      label="Обґрунтованість результатів"
                      value={review.methodologyScore}
                    />
                    <ScoreRow
                      label="Оформлення"
                      value={review.formattingScore}
                    />
                    <ScoreRow
                      label="Список літератури"
                      value={review.referencesScore}
                    />
                    <ScoreRow
                      label="Загальний рівень"
                      value={review.overallScore}
                    />
                  </div>
                </div>

                <div className="author-reviews__section">
                  <h3>Коментарі рецензента</h3>

                  <div className="author-reviews__text-block">
                    <strong>Основні зауваження</strong>
                    <p>{review.comments || "—"}</p>
                  </div>

                  <div className="author-reviews__text-block">
                    <strong>Рекомендації автору</strong>
                    <p>{review.recommendations || "—"}</p>
                  </div>

                  <div className="author-reviews__text-block">
                    <strong>Висновок рецензента</strong>
                    <p>{review.conclusion || "—"}</p>
                  </div>
                </div>

                <div className={getDecisionClass(review.decision)}>
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