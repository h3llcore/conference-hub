import { FileText, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReviewerSubmissionById } from "../features/submissions/submissions.api";
import {
  createOrUpdateReview,
  getMyReviewBySubmission,
  type ReviewDecision,
  type ReviewScore,
} from "../features/reviews/reviews.api";
import { getMyReviewerAssignments, takeAssignmentIntoWork } from "../features/assignments/assignments.api";
import "../styles/reviewer-review-form.css";

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
  createdAt: string;
  updatedAt: string;
};

type ReviewForm = {
  titleScore: ReviewScore;
  relevanceScore: ReviewScore;
  abstractScore: ReviewScore;
  structureScore: ReviewScore;
  methodologyScore: ReviewScore;
  formattingScore: ReviewScore;
  referencesScore: ReviewScore;
  overallScore: ReviewScore;
  comments: string;
  recommendations: string;
  conclusion: string;
  decision: ReviewDecision;
};

const initialForm: ReviewForm = {
  titleScore: "GOOD",
  relevanceScore: "GOOD",
  abstractScore: "GOOD",
  structureScore: "GOOD",
  methodologyScore: "GOOD",
  formattingScore: "GOOD",
  referencesScore: "GOOD",
  overallScore: "GOOD",
  comments: "",
  recommendations: "",
  conclusion: "",
  decision: "ACCEPT",
};

const scoreOptions: { value: ReviewScore; label: string }[] = [
  { value: "GOOD", label: "Добре" },
  { value: "SATISFACTORY", label: "Задовільно" },
  { value: "NEEDS_IMPROVEMENT", label: "Потребує доопрацювання" },
  { value: "UNSATISFACTORY", label: "Незадовільно" },
];

const decisionOptions: { value: ReviewDecision; label: string }[] = [
  { value: "ACCEPT", label: "Прийняти" },
  { value: "ACCEPT_WITH_REVISIONS", label: "Прийняти після доопрацювання" },
  { value: "REJECT", label: "Відхилити" },
];

export default function ReviewerReviewFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<ReviewerSubmission | null>(null);
  const [form, setForm] = useState<ReviewForm>(initialForm);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [startingWork, setStartingWork] = useState(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setPageLoading(true);
        setError("");

        if (!id) {
          throw new Error("Невірний ідентифікатор подання.");
        }

        const [submissionData, reviewData, assignmentsData] = await Promise.all([
          getReviewerSubmissionById(id),
          getMyReviewBySubmission(id),
          getMyReviewerAssignments(),
        ]);

        if (!isMounted) return;

        setSubmission(submissionData.submission || null);

        const currentAssignment = (assignmentsData.assignments || []).find(
          (item: any) => item.submission.id === id,
        );

        if (currentAssignment) {
          setCurrentRound(currentAssignment.round);
          setAssignmentId(currentAssignment.id);
        }

        if (reviewData.review) {
          setForm({
            titleScore: reviewData.review.titleScore,
            relevanceScore: reviewData.review.relevanceScore,
            abstractScore: reviewData.review.abstractScore,
            structureScore: reviewData.review.structureScore,
            methodologyScore: reviewData.review.methodologyScore,
            formattingScore: reviewData.review.formattingScore,
            referencesScore: reviewData.review.referencesScore,
            overallScore: reviewData.review.overallScore,
            comments: reviewData.review.comments || "",
            recommendations: reviewData.review.recommendations || "",
            conclusion: reviewData.review.conclusion || "",
            decision: reviewData.review.decision,
          });
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e.message || "Не вдалося завантажити форму рецензії.");
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleTakeIntoWork() {
    if (!assignmentId) return;

    try {
      setStartingWork(true);
      setError("");
      setSuccess("");

      await takeAssignmentIntoWork(assignmentId);
      setSuccess("Статтю взято в роботу.");
    } catch (e: any) {
      setError(e.message || "Не вдалося взяти статтю в роботу.");
    } finally {
      setStartingWork(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!submission) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createOrUpdateReview({
        submissionId: submission.id,
        ...form,
      });

      setSuccess("Рецензію успішно збережено.");
    } catch (e: any) {
      setError(e.message || "Не вдалося зберегти рецензію.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="review-form-page">
      <div className="review-form-page__hero">
        <p className="review-form-page__eyebrow">Форма рецензента</p>
        <h1 className="review-form-page__title">Оцінювання подання</h1>
        <p className="review-form-page__description">
          Заповніть критерії оцінювання, додайте зауваження та сформуйте
          підсумкове рішення щодо статті.
        </p>
      </div>

      <div className="review-form-page__layout">
        <main className="review-form-page__main">
          <form className="review-form-page__card" onSubmit={handleSubmit}>
            {pageLoading && (
              <div className="review-form-page__state">Завантаження...</div>
            )}

            {!pageLoading && error && (
              <div className="review-form-page__state review-form-page__state--error">
                {error}
              </div>
            )}

            {!pageLoading && success && (
              <div className="review-form-page__state review-form-page__state--success">
                {success}
              </div>
            )}

            {!pageLoading && submission && (
              <>
                <div className="review-form-page__section-header">
                  <div>
                    <h2>{submission.title}</h2>
                    <p>
                      {submission.venueType === "JOURNAL"
                        ? "Науковий журнал"
                        : "Конференція"}{" "}
                      • {submission.venue}
                    </p>
                    <p>Раунд рецензування: {currentRound}</p>
                  </div>
                </div>

                <div className="review-form-page__actions review-form-page__actions--top">
                  <button
                    type="button"
                    className="review-form-page__button review-form-page__button--secondary"
                    onClick={handleTakeIntoWork}
                    disabled={startingWork}
                  >
                    {startingWork ? "Оновлення..." : "Взяти в роботу"}
                  </button>
                </div>

                <div className="review-form-page__grid">
                  <div className="review-form-page__field">
                    <label htmlFor="titleScore">Коректність назви</label>
                    <select
                      id="titleScore"
                      name="titleScore"
                      value={form.titleScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="relevanceScore">Актуальність теми</label>
                    <select
                      id="relevanceScore"
                      name="relevanceScore"
                      value={form.relevanceScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="abstractScore">Якість анотації</label>
                    <select
                      id="abstractScore"
                      name="abstractScore"
                      value={form.abstractScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="structureScore">Логічність структури</label>
                    <select
                      id="structureScore"
                      name="structureScore"
                      value={form.structureScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="methodologyScore">
                      Обґрунтованість результатів
                    </label>
                    <select
                      id="methodologyScore"
                      name="methodologyScore"
                      value={form.methodologyScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="formattingScore">Якість оформлення</label>
                    <select
                      id="formattingScore"
                      name="formattingScore"
                      value={form.formattingScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="referencesScore">
                      Якість списку літератури
                    </label>
                    <select
                      id="referencesScore"
                      name="referencesScore"
                      value={form.referencesScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="review-form-page__field">
                    <label htmlFor="overallScore">Загальний рівень статті</label>
                    <select
                      id="overallScore"
                      name="overallScore"
                      value={form.overallScore}
                      onChange={handleChange}
                    >
                      {scoreOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="review-form-page__field">
                  <label htmlFor="comments">Основні зауваження</label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={5}
                    value={form.comments}
                    onChange={handleChange}
                    placeholder="Опишіть основні зауваження до статті"
                  />
                </div>

                <div className="review-form-page__field">
                  <label htmlFor="recommendations">Рекомендації автору</label>
                  <textarea
                    id="recommendations"
                    name="recommendations"
                    rows={4}
                    value={form.recommendations}
                    onChange={handleChange}
                    placeholder="Вкажіть, що потрібно виправити або доповнити"
                  />
                </div>

                <div className="review-form-page__field">
                  <label htmlFor="conclusion">Висновок рецензента</label>
                  <textarea
                    id="conclusion"
                    name="conclusion"
                    rows={4}
                    value={form.conclusion}
                    onChange={handleChange}
                    placeholder="Сформулюйте короткий підсумковий висновок"
                  />
                </div>

                <div className="review-form-page__field">
                  <label htmlFor="decision">Підсумкове рішення</label>
                  <select
                    id="decision"
                    name="decision"
                    value={form.decision}
                    onChange={handleChange}
                  >
                    {decisionOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="review-form-page__actions">
                  <button
                    type="button"
                    className="review-form-page__button review-form-page__button--secondary"
                    onClick={() => navigate("/reviewer")}
                  >
                    Назад
                  </button>

                  <button
                    type="submit"
                    className="review-form-page__button review-form-page__button--primary"
                    disabled={saving}
                  >
                    {saving ? "Збереження..." : "Зберегти рецензію"}
                  </button>
                </div>
              </>
            )}
          </form>
        </main>

        <aside className="review-form-page__sidebar">
          <div className="review-form-page__info-card">
            <div className="review-form-page__info-header">
              <FileText size={18} />
              <h3>Інформація про подання</h3>
            </div>

            {submission && (
              <ul>
                <li>
                  <strong>Назва:</strong> {submission.title}
                </li>
                <li>
                  <strong>Ключові слова:</strong> {submission.keywords}
                </li>
                <li>
                  <strong>Версія:</strong> {submission.version || 1}
                </li>
                <li>
                  <strong>Файл:</strong> {submission.fileName || "Не вказано"}
                </li>
              </ul>
            )}
          </div>

          <div className="review-form-page__info-card">
            <div className="review-form-page__info-header">
              <MessageSquareText size={18} />
              <h3>Підказка рецензенту</h3>
            </div>
            <ul>
              <li>Оцініть відповідність статті тематиці видання.</li>
              <li>Зверніть увагу на якість анотації й структуру.</li>
              <li>Додайте змістовні зауваження та рекомендації автору.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}