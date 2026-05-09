import { CheckCircle2, Eye, FileText, Megaphone, RotateCcw, Search, Users, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getCommitteeSubmissions,
  publishSubmission,
  updateReviewerSubmissionStatus,
} from "../features/submissions/submissions.api";
import {
  assignReviewers,
  getAssignmentsBySubmission,
} from "../features/assignments/assignments.api";
import { getCommitteeSubmissionReviews } from "../features/reviews/reviews.api";
import { getReviewers } from "../features/users/users.api";
import "../styles/committee-dashboard.css";

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
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "REVISION_REQUIRED"
    | "RESUBMITTED"
    | "ACCEPTED"
    | "REJECTED"
    | "PUBLISHED";
  version: number;
  currentRound: number;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    country: string;
  };
};

type Reviewer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  country: string;
};

type Assignment = {
  id: string;
  assignedAt: string;
  updatedAt: string;
  round: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
  reviewer: Reviewer;
};

type CommitteeReview = {
  id: string;
  round: number;
  decision: string;
  comments?: string | null;
  recommendations?: string | null;
  conclusion?: string | null;
  createdAt: string;
  reviewer: Reviewer;
};

function formatStatus(status: string) {
  if (status === "UNDER_REVIEW") return "На рецензуванні";
  if (status === "ACCEPTED") return "Прийнято";
  if (status === "REJECTED") return "Відхилено";
  if (status === "REVISION_REQUIRED") return "Потребує доопрацювання";
  if (status === "RESUBMITTED") return "Повторно подано";
  if (status === "PUBLISHED") return "Опубліковано";
  if (status === "DRAFT") return "Чернетка";
  return "Подано";
}

function formatDecision(decision: string) {
  if (decision === "ACCEPT") return "Прийняти";
  if (decision === "ACCEPT_WITH_REVISIONS") {
    return "Прийняти після доопрацювання";
  }
  return "Відхилити";
}

function formatAssignmentStatus(status: string) {
  if (status === "ASSIGNED") return "Призначено";
  if (status === "IN_PROGRESS") return "У роботі";
  if (status === "COMPLETED") return "Рецензію подано";
  return status;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("uk-UA");
}

export default function CommitteeDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reviews, setReviews] = useState<CommitteeReview[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions(showLoader = false) {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const submissionsData = await getCommitteeSubmissions();

        if (!isMounted) return;

        setSubmissions(submissionsData.submissions || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e.message || "Не вдалося завантажити подання.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function loadReviewers() {
      try {
        const reviewersData = await getReviewers();

        if (!isMounted) return;

        setReviewers(reviewersData.reviewers || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e.message || "Не вдалося завантажити рецензентів.");
      }
    }

    loadSubmissions(true);
    loadReviewers();

    const intervalId = window.setInterval(() => {
      loadSubmissions(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleSelectSubmission(submission: Submission) {
    try {
      setSelectedSubmission(submission);
      setDetailsLoading(true);
      setSelectedReviewerIds([]);

      const [assignmentsData, reviewsData] = await Promise.all([
        getAssignmentsBySubmission(submission.id),
        getCommitteeSubmissionReviews(submission.id),
      ]);

      setAssignments(assignmentsData.assignments || []);
      setReviews(reviewsData.reviews || []);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити деталі подання.");
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedSubmission) return;

    const selectedSubmissionId = selectedSubmission.id;
    let isMounted = true;

    async function refreshSelectedSubmissionDetails() {
      try {
        const [submissionsData, assignmentsData, reviewsData] = await Promise.all([
          getCommitteeSubmissions(),
          getAssignmentsBySubmission(selectedSubmissionId),
          getCommitteeSubmissionReviews(selectedSubmissionId),
        ]);

        if (!isMounted) return;

        const freshSubmissions = submissionsData.submissions || [];
        const freshSelectedSubmission = freshSubmissions.find(
          (item: Submission) => item.id === selectedSubmissionId
        );

        setSubmissions(freshSubmissions);

        if (freshSelectedSubmission) {
          setSelectedSubmission(freshSelectedSubmission);
        }

        setAssignments(assignmentsData.assignments || []);
        setReviews(reviewsData.reviews || []);
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Не вдалося оновити деталі подання.");
        }
      }
    }

    const intervalId = window.setInterval(() => {
      refreshSelectedSubmissionDetails();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [selectedSubmission?.id]);

  function handleToggleReviewer(reviewerId: string) {
    setSelectedReviewerIds((prev) => {
      if (prev.includes(reviewerId)) {
        return prev.filter((id) => id !== reviewerId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, reviewerId];
    });
  }

  function isReviewerAssignedInCurrentRound(reviewerId: string) {
    if (!selectedSubmission) return false;

    return assignments.some(
      (item) => item.reviewer.id === reviewerId && item.round === selectedSubmission.currentRound
    );
  }

  function hasReviewerIncompletePreviousRound(reviewerId: string) {
    if (!selectedSubmission) return false;

    return assignments.some(
      (item) =>
        item.reviewer.id === reviewerId &&
        item.round < selectedSubmission.currentRound &&
        item.status !== "COMPLETED"
    );
  }

  function getReviewerDisableReason(reviewerId: string) {
    if (isReviewerAssignedInCurrentRound(reviewerId)) {
      return "уже призначено в цьому раунді";
    }

    if (hasReviewerIncompletePreviousRound(reviewerId)) {
      return "не завершив попередній раунд";
    }

    return "";
  }

  function getDecisionRoundAssignments(submission: Submission) {
    if (selectedSubmission?.id !== submission.id) {
      return [];
    }

    if (assignments.length === 0) {
      return [];
    }

    const latestRound = Math.max(...assignments.map((item) => item.round));

    return assignments.filter((item) => item.round === latestRound);
  }

  function canMakeCommitteeDecision(submission: Submission) {
    const decisionRoundAssignments = getDecisionRoundAssignments(submission);

    if (decisionRoundAssignments.length === 0) {
      return false;
    }

    return decisionRoundAssignments.every((item) => item.status === "COMPLETED");
  }

  function getDecisionDisabledMessage(submission: Submission) {
    const decisionRoundAssignments = getDecisionRoundAssignments(submission);

    if (decisionRoundAssignments.length === 0) {
      return "Спочатку призначте рецензентів.";
    }

    const unfinishedCount = decisionRoundAssignments.filter(
      (item) => item.status !== "COMPLETED"
    ).length;

    if (unfinishedCount > 0) {
      return `Неможливо прийняти рішення: ще ${unfinishedCount} рецензент(и) перевіряють роботу.`;
    }

    return "";
  }

  async function handleAssignReviewers() {
    if (!selectedSubmission || selectedReviewerIds.length === 0) {
      return;
    }

    try {
      setAssignLoading(true);
      setError("");

      await assignReviewers({
        submissionId: selectedSubmission.id,
        reviewerIds: selectedReviewerIds,
      });

      const refreshedAssignments = await getAssignmentsBySubmission(selectedSubmission.id);

      setAssignments(refreshedAssignments.assignments || []);
      setSelectedReviewerIds([]);

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSubmission.id ? { ...item, status: "UNDER_REVIEW" } : item
        )
      );

      setSelectedSubmission((prev) => (prev ? { ...prev, status: "UNDER_REVIEW" } : prev));
    } catch (e: any) {
      setError(e.message || "Не вдалося призначити рецензентів.");
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleCommitteeDecision(
    submissionId: string,
    status: "ACCEPTED" | "REJECTED" | "REVISION_REQUIRED"
  ) {
    try {
      setActionLoadingId(submissionId);
      setError("");

      const data = await updateReviewerSubmissionStatus(submissionId, status);
      const updated = data.submission;

      setSubmissions((prev) => prev.map((item) => (item.id === submissionId ? updated : item)));

      setSelectedSubmission((prev) => (prev && prev.id === submissionId ? updated : prev));
    } catch (e: any) {
      setError(e.message || "Не вдалося змінити статус.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handlePublishSubmission(submissionId: string) {
    const confirmed = window.confirm(
      "Опублікувати цю статтю? Після цього вона з’явиться на головній сторінці."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(submissionId);
      setError("");

      const data = await publishSubmission(submissionId);
      const updated = data.submission;

      setSubmissions((prev) => prev.map((item) => (item.id === submissionId ? updated : item)));

      setSelectedSubmission((prev) => (prev && prev.id === submissionId ? updated : prev));
    } catch (e: any) {
      setError(e.message || "Не вдалося опублікувати статтю.");
    } finally {
      setActionLoadingId("");
    }
  }

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return submissions;

    return submissions.filter((item) => {
      const title = item.title.toLowerCase();
      const venue = item.venue.toLowerCase();
      const author = item.author
        ? `${item.author.firstName} ${item.author.lastName}`.toLowerCase()
        : "";
      const keywords = item.keywords.toLowerCase();

      return (
        title.includes(query) ||
        venue.includes(query) ||
        author.includes(query) ||
        keywords.includes(query)
      );
    });
  }, [submissions, search]);

  return (
    <section className="committee-dashboard">
      <div className="committee-dashboard__hero">
        <div className="committee-dashboard__hero-content">
          <p className="committee-dashboard__eyebrow">Кабінет оргкомітету</p>
          <h1 className="committee-dashboard__title">Керування поданнями та рецензуванням</h1>
          <p className="committee-dashboard__description">
            Переглядайте всі подання, призначайте рецензентів, контролюйте рецензії та приймайте
            фінальні рішення.
          </p>
        </div>
      </div>

      <div className="committee-dashboard__toolbar">
        <div className="committee-dashboard__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Пошук за назвою, автором, журналом або ключовими словами"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="committee-dashboard__state committee-dashboard__state--error">{error}</div>
      )}

      <div className="committee-dashboard__layout">
        <main className="committee-dashboard__main">
          {loading && <div className="committee-dashboard__state">Завантаження подань...</div>}

          {!loading && filteredSubmissions.length === 0 && (
            <div className="committee-dashboard__state">Подань поки немає.</div>
          )}

          {!loading && filteredSubmissions.length > 0 && (
            <div className="committee-dashboard__list">
              {filteredSubmissions.map((item) => {
                const isSelected = selectedSubmission?.id === item.id;
                const decisionDisabled = !canMakeCommitteeDecision(item);
                const disabledMessage = getDecisionDisabledMessage(item);

                return (
                  <article key={item.id} className="committee-dashboard__card">
                    <div className="committee-dashboard__card-top">
                      <div>
                        <h3>{item.title}</h3>
                        <p>
                          {item.author
                            ? `${item.author.firstName} ${item.author.lastName} • ${item.author.institution}`
                            : "Автор не вказаний"}
                        </p>
                      </div>

                      <span
                        className={`committee-dashboard__status ${
                          item.status === "REVISION_REQUIRED"
                            ? "committee-dashboard__status--revision"
                            : ""
                        }`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>

                    <div className="committee-dashboard__meta">
                      <span>
                        Тип: {item.venueType === "JOURNAL" ? "Науковий журнал" : "Конференція"}
                      </span>
                      <span>{item.venue}</span>
                      <span>Версія: {item.version}</span>
                      <span>Раунд: {item.currentRound}</span>
                      <span>Дата подання: {formatDate(item.createdAt)}</span>
                      {item.fileName && <span>Файл: {item.fileName}</span>}
                    </div>

                    <p className="committee-dashboard__excerpt">{item.abstract}</p>

                    <div className="committee-dashboard__actions">
                      <button type="button" onClick={() => handleSelectSubmission(item)}>
                        <Eye size={16} />
                        <span>Відкрити</span>
                      </button>

                      {decisionDisabled && isSelected && (
                        <div className="committee-dashboard__decision-warning">
                          {disabledMessage}
                        </div>
                      )}

                      <button
                        type="button"
                        className="committee-dashboard__action committee-dashboard__action--revision"
                        disabled={decisionDisabled || actionLoadingId === item.id}
                        title={decisionDisabled ? disabledMessage : ""}
                        onClick={() => handleCommitteeDecision(item.id, "REVISION_REQUIRED")}
                      >
                        <RotateCcw size={16} />
                        <span>На доопрацювання</span>
                      </button>

                      <button
                        type="button"
                        className="committee-dashboard__action committee-dashboard__action--accept"
                        disabled={decisionDisabled || actionLoadingId === item.id}
                        title={decisionDisabled ? disabledMessage : ""}
                        onClick={() => handleCommitteeDecision(item.id, "ACCEPTED")}
                      >
                        <CheckCircle2 size={16} />
                        <span>Прийняти</span>
                      </button>

                      {item.status === "ACCEPTED" && (
                        <button
                          type="button"
                          className="committee-dashboard__action committee-dashboard__action--publish"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handlePublishSubmission(item.id)}
                        >
                          <Megaphone size={16} />
                          <span>Опублікувати</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="committee-dashboard__action committee-dashboard__action--reject"
                        disabled={decisionDisabled || actionLoadingId === item.id}
                        title={decisionDisabled ? disabledMessage : ""}
                        onClick={() => handleCommitteeDecision(item.id, "REJECTED")}
                      >
                        <XCircle size={16} />
                        <span>Відхилити</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <aside className="committee-dashboard__sidebar">
          <div className="committee-dashboard__panel">
            <h2>Деталі подання</h2>

            {!selectedSubmission && (
              <p className="committee-dashboard__placeholder">
                Оберіть подання зі списку, щоб переглянути деталі та призначити рецензентів.
              </p>
            )}

            {detailsLoading && (
              <div className="committee-dashboard__state">Завантаження деталей...</div>
            )}

            {!detailsLoading && selectedSubmission && (
              <>
                <div className="committee-dashboard__detail-block">
                  <h3>{selectedSubmission.title}</h3>
                  <p>
                    <strong>Автор:</strong>{" "}
                    {selectedSubmission.author
                      ? `${selectedSubmission.author.firstName} ${selectedSubmission.author.lastName}`
                      : "—"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedSubmission.author?.email || "—"}
                  </p>
                  <p>
                    <strong>Установа:</strong> {selectedSubmission.author?.institution || "—"}
                  </p>
                  <p>
                    <strong>Журнал / конференція:</strong> {selectedSubmission.venue}
                  </p>
                  <p>
                    <strong>Версія:</strong> {selectedSubmission.version}
                  </p>
                  <p>
                    <strong>Раунд:</strong> {selectedSubmission.currentRound}
                  </p>
                  <p>
                    <strong>Файл:</strong> {selectedSubmission.fileName || "Не вказано"}
                  </p>
                </div>

                <div className="committee-dashboard__detail-block">
                  <div className="committee-dashboard__block-header">
                    <Users size={18} />
                    <h3>Призначення рецензентів</h3>
                  </div>

                  <p className="committee-dashboard__hint">Можна вибрати від 1 до 3 рецензентів.</p>

                  <div className="committee-dashboard__reviewers">
                    {reviewers.map((reviewer) => {
                      const reason = getReviewerDisableReason(reviewer.id);
                      const disabled = Boolean(reason);

                      return (
                        <label
                          key={reviewer.id}
                          className={`committee-dashboard__reviewer-item ${
                            disabled ? "committee-dashboard__reviewer-item--disabled" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedReviewerIds.includes(reviewer.id)}
                            onChange={() => handleToggleReviewer(reviewer.id)}
                            disabled={disabled}
                          />
                          <span>
                            {reviewer.firstName} {reviewer.lastName}
                            {reason ? ` • ${reason}` : ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="committee-dashboard__assign-button"
                    onClick={handleAssignReviewers}
                    disabled={assignLoading || selectedReviewerIds.length === 0}
                  >
                    {assignLoading ? "Призначення..." : "Призначити рецензентів"}
                  </button>

                  <div className="committee-dashboard__assigned-list">
                    <h4>Призначення по раундах:</h4>

                    {assignments.length === 0 && <p>Рецензентів ще не призначено.</p>}

                    {assignments.map((item) => (
                      <div key={item.id} className="committee-dashboard__assigned-item">
                        <span>
                          {item.reviewer.firstName} {item.reviewer.lastName} • Раунд {item.round}
                        </span>
                        <strong>{formatAssignmentStatus(item.status)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="committee-dashboard__detail-block">
                  <div className="committee-dashboard__block-header">
                    <FileText size={18} />
                    <h3>Рецензії</h3>
                  </div>

                  {reviews.length === 0 && <p>Рецензій поки немає.</p>}

                  {reviews.map((review) => (
                    <article key={review.id} className="committee-dashboard__review-card">
                      <p>
                        <strong>Рецензент:</strong> {review.reviewer.firstName}{" "}
                        {review.reviewer.lastName}
                      </p>
                      <p>
                        <strong>Раунд:</strong> {review.round}
                      </p>
                      <p>
                        <strong>Рішення:</strong> {formatDecision(review.decision)}
                      </p>
                      <p>
                        <strong>Коментарі:</strong> {review.comments || "—"}
                      </p>
                      <p>
                        <strong>Рекомендації:</strong> {review.recommendations || "—"}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
