import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  LinkIcon,
  Plus,
  Send,
  UsersRound,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  addProgramItem,
  createProgramSection,
  finishConferenceProgram,
  getAcceptedConferenceSubmissions,
  getConferenceProgramById,
  publishConferenceProgram,
  sendConferenceInvitations,
} from "../features/programs/programs.api";
import type { AcceptedConferenceSubmission, ConferenceProgram } from "../types/programs.types";
import { useAuth } from "../features/auth/AuthContext";
import "../styles/programs.css";

type SectionForm = {
  title: string;
  description: string;
  order: string;
  startTime: string;
  endTime: string;
};

type ItemForm = {
  sectionId: string;
  submissionId: string;
  title: string;
  speakerName: string;
  speakerEmail: string;
  startTime: string;
  endTime: string;
  order: string;
};

const emptySectionForm: SectionForm = {
  title: "",
  description: "",
  order: "1",
  startTime: "",
  endTime: "",
};

const emptyItemForm: ItemForm = {
  sectionId: "",
  submissionId: "",
  title: "",
  speakerName: "",
  speakerEmail: "",
  startTime: "",
  endTime: "",
  order: "1",
};

function formatDateTime(date?: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(date?: string | null) {
  if (!date) return "Час не вказано";

  return new Date(date).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  if (status === "PUBLISHED") return "Опубліковано";
  if (status === "FINISHED") return "Завершено";
  if (status === "ARCHIVED") return "В архіві";
  return "Чернетка";
}

export default function ProgramDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [program, setProgram] = useState<ConferenceProgram | null>(null);
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<AcceptedConferenceSubmission[]>(
    []
  );
  const [sectionForm, setSectionForm] = useState<SectionForm>(emptySectionForm);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);

  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const isCommittee = user?.role === "COMMITTEE";

  async function loadProgram() {
    if (!id) return;

    try {
      setError("");
      const data = await getConferenceProgramById(id);
      setProgram(data.program || null);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити програму.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgram();
  }, [id]);

  useEffect(() => {
    async function loadAccepted() {
      if (!isCommittee) return;

      try {
        const data = await getAcceptedConferenceSubmissions();
        setAcceptedSubmissions(data.submissions || []);
      } catch (e) {
        console.error(e);
      }
    }

    loadAccepted();
  }, [isCommittee]);

  const sortedSections = useMemo(() => {
    return [...(program?.sections || [])].sort((a, b) => a.order - b.order);
  }, [program]);

  const programStats = useMemo(() => {
    const sectionsCount = sortedSections.length;

    const reportsCount = sortedSections.reduce((total, section) => total + section.items.length, 0);

    const speakersCount = new Set(
      sortedSections.flatMap((section) =>
        section.items.map((item) => item.speakerEmail || item.speakerName)
      )
    ).size;

    return {
      sectionsCount,
      reportsCount,
      speakersCount,
    };
  }, [sortedSections]);

  function handleSectionChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setSectionForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleItemChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    setItemForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "submissionId") {
        const submission = acceptedSubmissions.find((item) => item.id === value);

        if (submission) {
          next.title = submission.title;
          next.speakerName = `${submission.author.firstName} ${submission.author.lastName}`;
          next.speakerEmail = submission.author.email;
        }
      }

      return next;
    });
  }

  async function handleCreateSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) return;

    if (!sectionForm.title.trim()) {
      setError("Вкажіть назву секції.");
      return;
    }

    try {
      setSectionLoading(true);
      setError("");

      await createProgramSection(id, {
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim() || undefined,
        order: Number(sectionForm.order) || 1,
        startTime: sectionForm.startTime || undefined,
        endTime: sectionForm.endTime || undefined,
      });

      setSectionForm(emptySectionForm);
      await loadProgram();
    } catch (e: any) {
      setError(e.message || "Не вдалося створити секцію.");
    } finally {
      setSectionLoading(false);
    }
  }

  async function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!itemForm.sectionId || !itemForm.title.trim() || !itemForm.speakerName.trim()) {
      setError("Оберіть секцію, вкажіть назву доповіді та доповідача.");
      return;
    }

    try {
      setItemLoading(true);
      setError("");

      await addProgramItem({
        sectionId: itemForm.sectionId,
        submissionId: itemForm.submissionId || undefined,
        title: itemForm.title.trim(),
        speakerName: itemForm.speakerName.trim(),
        speakerEmail: itemForm.speakerEmail.trim() || undefined,
        startTime: itemForm.startTime || undefined,
        endTime: itemForm.endTime || undefined,
        order: Number(itemForm.order) || 1,
      });

      setItemForm(emptyItemForm);
      await loadProgram();
    } catch (e: any) {
      setError(e.message || "Не вдалося додати доповідь.");
    } finally {
      setItemLoading(false);
    }
  }

  async function handlePublish() {
    if (!id) return;

    try {
      setActionLoading(true);
      setError("");

      await publishConferenceProgram(id);
      await loadProgram();
    } catch (e: any) {
      setError(e.message || "Не вдалося опублікувати програму.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendInvitations() {
    if (!id) return;

    try {
      setActionLoading(true);
      setError("");

      await sendConferenceInvitations(id);
      await loadProgram();
    } catch (e: any) {
      setError(e.message || "Не вдалося надіслати запрошення.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFinish() {
    if (!id) return;

    const confirmed = window.confirm(
      "Ви дійсно хочете завершити конференцію? Після цього вона буде показуватись в архіві."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await finishConferenceProgram(id);
      await loadProgram();
    } catch (e: any) {
      setError(e.message || "Не вдалося завершити конференцію.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="programs-empty">Завантаження програми...</div>;
  }

  if (!program) {
    return <div className="programs-empty">Програму не знайдено.</div>;
  }

  return (
    <section className="program-details">
      <div className="program-details__hero">
        <div>
          <span
            className={`program-card__status program-card__status--${program.status.toLowerCase()}`}
          >
            {getStatusLabel(program.status)}
          </span>

          <h1>{program.title}</h1>
          <p>{program.description || "Опис програми ще не додано."}</p>

          <div className="program-details__meta">
            <span>
              <CalendarDays size={16} />
              {formatDateTime(program.startDate)}
            </span>

            {program.meetingUrl && (
              <a href={program.meetingUrl} target="_blank" rel="noreferrer">
                <LinkIcon size={16} />
                Онлайн-зустріч
              </a>
            )}
          </div>
        </div>

        {isCommittee && (
          <div className="program-details__actions">
            {program.status === "DRAFT" && (
              <button type="button" onClick={handlePublish} disabled={actionLoading}>
                Опублікувати
              </button>
            )}

            {program.status === "PUBLISHED" && (
              <>
                <button type="button" onClick={handleSendInvitations} disabled={actionLoading}>
                  <Send size={15} />
                  Надіслати запрошення
                </button>

                <button
                  type="button"
                  className="program-details__finish"
                  onClick={handleFinish}
                  disabled={actionLoading}
                >
                  Завершити конференцію
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="program-overview-grid">
        <article className="program-overview-card">
          <div className="program-overview-card__icon">
            <FileText size={20} />
          </div>

          <h2>Про конференцію</h2>

          <p>
            {program.description || program.venue?.description || "Опис конференції ще не додано."}
          </p>
        </article>

        <article className="program-overview-card">
          <div className="program-overview-card__icon">
            <CheckCircle2 size={20} />
          </div>

          <h2>Вимоги до участі</h2>

          <ul>
            <li>подання наукової статті або доповіді;</li>
            <li>відповідність матеріалів тематиці конференції;</li>
            <li>дотримання дедлайнів та вимог оформлення;</li>
            <li>проходження перевірки оргкомітетом.</li>
          </ul>
        </article>

        <article className="program-overview-card">
          <div className="program-overview-card__icon">
            <UsersRound size={20} />
          </div>

          <h2>Учасники та секції</h2>

          <p>
            Програма конференції складається із тематичних секцій, у межах яких розміщуються
            доповіді авторів та запрошених учасників.
          </p>
        </article>

        <article className="program-overview-card program-overview-card--stats">
          <h2>Статистика програми</h2>

          <div className="program-overview-stats">
            <div>
              <strong>{programStats.sectionsCount}</strong>
              <span>секцій</span>
            </div>

            <div>
              <strong>{programStats.reportsCount}</strong>
              <span>доповідей</span>
            </div>

            <div>
              <strong>{programStats.speakersCount}</strong>
              <span>учасників</span>
            </div>
          </div>
        </article>
      </div>

      {error && <div className="programs-alert programs-alert--error">{error}</div>}

      {isCommittee && program.status !== "FINISHED" && program.status !== "ARCHIVED" && (
        <div className="program-admin-grid">
          <form className="programs-form" onSubmit={handleCreateSection}>
            <div className="programs-form__title">
              <Plus size={18} />
              <h2>Додати секцію</h2>
            </div>

            <label>
              Назва секції
              <input
                name="title"
                value={sectionForm.title}
                onChange={handleSectionChange}
                placeholder="Наприклад: Секція 1. Інформаційні технології"
              />
            </label>

            <label>
              Опис
              <textarea
                name="description"
                value={sectionForm.description}
                onChange={handleSectionChange}
                rows={3}
              />
            </label>

            <div className="programs-form__grid">
              <label>
                Порядок
                <input
                  type="number"
                  name="order"
                  value={sectionForm.order}
                  onChange={handleSectionChange}
                />
              </label>

              <label>
                Початок
                <input
                  type="datetime-local"
                  name="startTime"
                  value={sectionForm.startTime}
                  onChange={handleSectionChange}
                />
              </label>

              <label>
                Завершення
                <input
                  type="datetime-local"
                  name="endTime"
                  value={sectionForm.endTime}
                  onChange={handleSectionChange}
                />
              </label>
            </div>

            <button type="submit" disabled={sectionLoading}>
              {sectionLoading ? "Додавання..." : "Додати секцію"}
            </button>
          </form>

          <form className="programs-form" onSubmit={handleAddItem}>
            <div className="programs-form__title">
              <Plus size={18} />
              <h2>Додати доповідь</h2>
            </div>

            <label>
              Секція
              <select name="sectionId" value={itemForm.sectionId} onChange={handleItemChange}>
                <option value="">Оберіть секцію</option>
                {sortedSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Прийнята стаття
              <select name="submissionId" value={itemForm.submissionId} onChange={handleItemChange}>
                <option value="">Без прив’язки до статті</option>
                {acceptedSubmissions.map((submission) => (
                  <option key={submission.id} value={submission.id}>
                    {submission.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Назва доповіді
              <input name="title" value={itemForm.title} onChange={handleItemChange} />
            </label>

            <div className="programs-form__grid">
              <label>
                Доповідач
                <input
                  name="speakerName"
                  value={itemForm.speakerName}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Email доповідача
                <input
                  name="speakerEmail"
                  value={itemForm.speakerEmail}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Порядок
                <input
                  type="number"
                  name="order"
                  value={itemForm.order}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Початок
                <input
                  type="datetime-local"
                  name="startTime"
                  value={itemForm.startTime}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Завершення
                <input
                  type="datetime-local"
                  name="endTime"
                  value={itemForm.endTime}
                  onChange={handleItemChange}
                />
              </label>
            </div>

            <button type="submit" disabled={itemLoading}>
              {itemLoading ? "Додавання..." : "Додати доповідь"}
            </button>
          </form>
        </div>
      )}

      <div className="program-schedule">
        {sortedSections.length === 0 ? (
          <div className="programs-empty">У програмі ще немає секцій.</div>
        ) : (
          sortedSections.map((section) => (
            <article key={section.id} className="program-section">
              <div className="program-section__header">
                <div>
                  <h2>{section.title}</h2>
                  {section.description && <p>{section.description}</p>}
                </div>

                <span>
                  {formatTime(section.startTime)} — {formatTime(section.endTime)}
                </span>
              </div>

              {section.items.length === 0 ? (
                <p className="program-section__empty">Доповіді ще не додано.</p>
              ) : (
                <div className="program-items">
                  {[...section.items]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div key={item.id} className="program-item">
                        <div className="program-item__time">{formatTime(item.startTime)}</div>

                        <div>
                          <h3>{item.title}</h3>
                          <p>
                            {item.speakerName}
                            {item.speakerEmail ? ` · ${item.speakerEmail}` : ""}
                          </p>

                          {item.submission?.author?.institution && (
                            <small>{item.submission.author.institution}</small>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
