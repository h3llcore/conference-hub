import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, FilePlus2, Plus, Send, Trash2 } from "lucide-react";
import { getVenues } from "../features/venues/venues.api";
import {
  addSubmissionToIssue,
  createPublicationIssue,
  deletePublicationIssue,
  getAvailableIssueSubmissions,
  getPublicationIssues,
  publishPublicationIssue,
  removeSubmissionFromIssue,
  type IssueSubmission,
  type PublicationIssue,
  type PublicationIssueType,
} from "../features/publication-issues/publication-issues.api";
import "../styles/committee-issues.css";

type VenueOption = {
  id: string;
  title: string;
  type: "JOURNAL" | "CONFERENCE";
};

type IssueForm = {
  type: PublicationIssueType;
  venueId: string;
  title: string;
  description: string;
  volume: string;
  issueNumber: string;
  year: string;
  publishedAt: string;
};

const initialForm: IssueForm = {
  type: "JOURNAL",
  venueId: "",
  title: "",
  description: "",
  volume: "",
  issueNumber: "",
  year: String(new Date().getFullYear()),
  publishedAt: "",
};

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type: PublicationIssueType) {
  return type === "JOURNAL" ? "Випуск журналу" : "Збірник конференції";
}

function getStatusLabel(status: string) {
  if (status === "PUBLISHED") return "Опубліковано";
  if (status === "ARCHIVED") return "В архіві";
  return "Чернетка";
}

export default function CommitteeIssuesPage() {
  const [issues, setIssues] = useState<PublicationIssue[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [availableSubmissions, setAvailableSubmissions] = useState<
    IssueSubmission[]
  >([]);

  const [form, setForm] = useState<IssueForm>(initialForm);
  const [selectedSubmissions, setSelectedSubmissions] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => venue.type === form.type);
  }, [venues, form.type]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [issuesData, availableData, journalsData, conferencesData] =
        await Promise.all([
          getPublicationIssues(),
          getAvailableIssueSubmissions(),
          getVenues({ type: "JOURNAL", limit: 100, sort: "newest" }),
          getVenues({ type: "CONFERENCE", limit: 100, sort: "newest" }),
        ]);

      setIssues(issuesData.issues || []);
      setAvailableSubmissions(availableData.submissions || []);

      setVenues([
        ...(journalsData.venues || []),
        ...(conferencesData.venues || []),
      ]);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити дані.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!error && !success) return;

    const timer = window.setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [error, success]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "type") {
        return {
          ...prev,
          type: value as PublicationIssueType,
          venueId: "",
          volume: value === "JOURNAL" ? prev.volume : "",
          issueNumber: value === "JOURNAL" ? prev.issueNumber : "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.venueId) {
      setError("Вкажіть назву та оберіть журнал або конференцію.");
      return;
    }

    try {
      setCreating(true);

      await createPublicationIssue({
        type: form.type,
        venueId: form.venueId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        volume: form.volume ? Number(form.volume) : undefined,
        issueNumber: form.issueNumber ? Number(form.issueNumber) : undefined,
        year: form.year ? Number(form.year) : undefined,
        publishedAt: form.publishedAt || undefined,
      });

      setForm(initialForm);
      setSuccess("Випуск / збірник успішно створено.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося створити випуск.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddSubmission(issueId: string) {
    const submissionId = selectedSubmissions[issueId];

    if (!submissionId) {
      setError("Оберіть опубліковану статтю для додавання.");
      return;
    }

    try {
      setActionLoadingId(issueId);
      setError("");

      await addSubmissionToIssue(issueId, submissionId);

      setSelectedSubmissions((prev) => ({
        ...prev,
        [issueId]: "",
      }));

      setSuccess("Статтю додано до випуску / збірника.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося додати статтю у випуск.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleRemoveSubmission(submissionId: string) {
    if (!window.confirm("Прибрати статтю з випуску?")) return;

    try {
      setActionLoadingId(submissionId);
      setError("");

      await removeSubmissionFromIssue(submissionId);
      setSuccess("Статтю прибрано з випуску / збірника.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося прибрати статтю.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handlePublish(issueId: string) {
    if (!window.confirm("Опублікувати цей випуск / збірник?")) return;

    try {
      setActionLoadingId(issueId);
      setError("");

      await publishPublicationIssue(issueId);
      setSuccess("Випуск / збірник опубліковано.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося опублікувати випуск.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleDelete(issueId: string) {
    if (!window.confirm("Видалити випуск / збірник?")) return;

    try {
      setActionLoadingId(issueId);
      setError("");

      await deletePublicationIssue(issueId);
      setSuccess("Випуск / збірник видалено.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося видалити випуск.");
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <section className="committee-issues">
      <div className="committee-issues__container">
        <div className="committee-issues__hero">
          <p>Модуль публікацій</p>
          <h1>Формування випусків журналів та збірників конференцій</h1>
          <span>
            Створюйте випуски, додавайте опубліковані статті та публікуйте
            готові збірники.
          </span>
        </div>

        {error && <div className="committee-issues__alert">{error}</div>}

        {success && (
          <div className="committee-issues__alert committee-issues__alert--success">
            {success}
          </div>
        )}

        <form className="committee-issues-form" onSubmit={handleCreate}>
          <div className="committee-issues-form__title">
            <FilePlus2 size={18} />
            <h2>Створити випуск / збірник</h2>
          </div>

          <div className="committee-issues-form__grid">
            <label>
              Тип
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="JOURNAL">Випуск журналу</option>
                <option value="CONFERENCE">Збірник конференції</option>
              </select>
            </label>

            <label>
              {form.type === "JOURNAL" ? "Журнал" : "Конференція"}
              <select name="venueId" value={form.venueId} onChange={handleChange}>
                <option value="">Оберіть</option>
                {filteredVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Назва
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={
                  form.type === "JOURNAL"
                    ? "Наприклад: Том 2, Випуск 1"
                    : "Наприклад: Збірник матеріалів конференції"
                }
              />
            </label>

            <label>
              Рік
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
              />
            </label>

            {form.type === "JOURNAL" && (
              <>
                <label>
                  Том
                  <input
                    type="number"
                    name="volume"
                    value={form.volume}
                    onChange={handleChange}
                    placeholder="1"
                  />
                </label>

                <label>
                  Номер випуску
                  <input
                    type="number"
                    name="issueNumber"
                    value={form.issueNumber}
                    onChange={handleChange}
                    placeholder="1"
                  />
                </label>
              </>
            )}

            <label>
              Дата публікації
              <input
                type="datetime-local"
                name="publishedAt"
                value={form.publishedAt}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Опис
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Короткий опис випуску або збірника"
            />
          </label>

          <button type="submit" disabled={creating}>
            <Plus size={16} />
            {creating ? "Створення..." : "Створити"}
          </button>
        </form>

        <div className="committee-issues__list">
          {loading ? (
            <div className="committee-issues__empty">Завантаження...</div>
          ) : issues.length === 0 ? (
            <div className="committee-issues__empty">
              Випусків або збірників поки немає.
            </div>
          ) : (
            issues.map((issue) => (
              <article key={issue.id} className="committee-issue-card">
                <div className="committee-issue-card__top">
                  <div>
                    <span className="committee-issue-card__type">
                      <BookOpen size={14} />
                      {getTypeLabel(issue.type)}
                    </span>

                    <h2>{issue.title}</h2>

                    <p>
                      {issue.description || "Опис випуску поки не додано."}
                    </p>
                  </div>

                  <span
                    className={`committee-issue-card__status committee-issue-card__status--${issue.status.toLowerCase()}`}
                  >
                    {getStatusLabel(issue.status)}
                  </span>
                </div>

                <div className="committee-issue-card__meta">
                  <span>{issue.venue?.title || "Без майданчика"}</span>
                  {issue.year && <span>Рік: {issue.year}</span>}
                  {issue.volume && <span>Том: {issue.volume}</span>}
                  {issue.issueNumber && <span>№ {issue.issueNumber}</span>}
                  <span>Дата: {formatDate(issue.publishedAt)}</span>
                </div>

                <div className="committee-issue-card__submissions">
                  <h3>Статті у випуску</h3>

                  {issue.submissions.length === 0 ? (
                    <p>Статті ще не додано.</p>
                  ) : (
                    issue.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="committee-issue-card__submission"
                      >
                        <div>
                          <strong>{submission.title}</strong>
                          <span>
                            {submission.author
                              ? `${submission.author.firstName} ${submission.author.lastName} • ${submission.author.institution}`
                              : "Автор не вказаний"}
                          </span>
                        </div>

                        {issue.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === submission.id}
                            onClick={() =>
                              handleRemoveSubmission(submission.id)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {issue.status !== "ARCHIVED" && (
                  <div className="committee-issue-card__add">
                    <select
                      value={selectedSubmissions[issue.id] || ""}
                      onChange={(event) =>
                        setSelectedSubmissions((prev) => ({
                          ...prev,
                          [issue.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Оберіть опубліковану статтю</option>

                      {availableSubmissions.map((submission) => (
                        <option key={submission.id} value={submission.id}>
                          {submission.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={actionLoadingId === issue.id}
                      onClick={() => handleAddSubmission(issue.id)}
                    >
                      Додати статтю
                    </button>
                  </div>
                )}

                <div className="committee-issue-card__actions">
                  {issue.status === "DRAFT" && (
                    <button
                      type="button"
                      disabled={actionLoadingId === issue.id}
                      onClick={() => handlePublish(issue.id)}
                    >
                      <Send size={16} />
                      Опублікувати
                    </button>
                  )}

                  {issue.status === "PUBLISHED" && (
                    <Link
                      to={`/issues/${issue.id}`}
                      className="committee-issue-card__view"
                    >
                      <Eye size={16} />
                      Переглянути
                    </Link>
                  )}

                  <button
                    type="button"
                    className="committee-issue-card__delete"
                    disabled={actionLoadingId === issue.id}
                    onClick={() => handleDelete(issue.id)}
                  >
                    <Trash2 size={16} />
                    Видалити
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}