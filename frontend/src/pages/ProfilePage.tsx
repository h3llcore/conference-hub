import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Plus, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  createConferenceProgram,
  getConferencePrograms,
  publishConferenceProgram,
  sendConferenceInvitations,
} from "../features/programs/programs.api";
import { getVenues } from "../features/venues/venues.api";
import type { ConferenceProgram } from "../types/programs.types";
import { useAuth } from "../features/auth/AuthContext";
import "../styles/programs.css";

type ProgramForm = {
  venueId: string;
  title: string;
  description: string;
  meetingUrl: string;
  startDate: string;
  endDate: string;
};

type ConferenceOption = {
  id: string;
  title: string;
};

const emptyForm: ProgramForm = {
  venueId: "",
  title: "",
  description: "",
  meetingUrl: "",
  startDate: "",
  endDate: "",
};

function formatDate(date?: string | null) {
  if (!date) return "Не вказано";

  return new Date(date).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

export default function ProgramsPage() {
  const { user } = useAuth();

  const [programs, setPrograms] = useState<ConferenceProgram[]>([]);
  const [conferences, setConferences] = useState<ConferenceOption[]>([]);
  const [form, setForm] = useState<ProgramForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isCommittee = user?.role === "COMMITTEE";

  const activePrograms = useMemo(() => {
    return programs.filter((program) => {
      if (program.status === "FINISHED" || program.status === "ARCHIVED") {
        return false;
      }

      if (program.endDate && new Date(program.endDate) < new Date()) {
        return false;
      }

      return true;
    });
  }, [programs]);

  async function loadPrograms() {
    try {
      setLoading(true);
      setError("");

      const [programsData, conferencesData] = await Promise.all([
        getConferencePrograms(),
        getVenues({
          type: "CONFERENCE",
          limit: 100,
          sort: "newest",
        }),
      ]);

      setPrograms(programsData.programs || []);
      setConferences(conferencesData.venues || []);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити програми конференцій.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (!error && !success) return;

    const timer = window.setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [error, success]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.venueId || !form.title.trim() || !form.startDate) {
      setError("Оберіть конференцію, вкажіть назву програми та дату початку.");
      return;
    }

    try {
      setCreating(true);

      await createConferenceProgram({
        venueId: form.venueId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        meetingUrl: form.meetingUrl.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });

      setForm(emptyForm);
      setSuccess("Програму конференції успішно створено.");
      await loadPrograms();
    } catch (e: any) {
      setError(e.message || "Не вдалося створити програму.");
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish(programId: string) {
    try {
      setActionLoadingId(programId);
      setError("");
      setSuccess("");

      await publishConferenceProgram(programId);

      setSuccess("Програму конференції опубліковано.");
      await loadPrograms();
    } catch (e: any) {
      setError(e.message || "Не вдалося опублікувати програму.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleSendInvitations(programId: string) {
    try {
      setActionLoadingId(programId);
      setError("");
      setSuccess("");

      await sendConferenceInvitations(programId);

      setSuccess("Запрошення авторам успішно надіслано.");
      await loadPrograms();
    } catch (e: any) {
      setError(e.message || "Не вдалося надіслати запрошення.");
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <section className="programs-page">
      <div className="programs-page__header">
        <div>
          <p className="programs-page__eyebrow">Conference Hub</p>

          <h1>Програми конференцій</h1>

          <p>
            Тут можна переглядати програму конференції, розклад доповідей,
            секції, посилання на онлайн-зустріч та запрошення авторам.
          </p>
        </div>
      </div>

      {error && <div className="programs-alert programs-alert--error">{error}</div>}

      {success && (
        <div className="programs-alert programs-alert--success">{success}</div>
      )}

      {isCommittee && (
        <form className="programs-form" onSubmit={handleCreate}>
          <div className="programs-form__title">
            <Plus size={18} />
            <h2>Створити програму конференції</h2>
          </div>

          <div className="programs-form__grid">
            <label>
              Конференція
              <select
                name="venueId"
                value={form.venueId}
                onChange={handleChange}
              >
                <option value="">Оберіть конференцію</option>

                {conferences.map((conference) => (
                  <option key={conference.id} value={conference.id}>
                    {conference.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Назва програми
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Наприклад: Програма конференції 2026"
              />
            </label>

            <label>
              Початок
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Завершення
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Посилання на зустріч
              <input
                name="meetingUrl"
                value={form.meetingUrl}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
              />
            </label>
          </div>

          <label>
            Опис
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Короткий опис програми конференції"
              rows={3}
            />
          </label>

          <button type="submit" disabled={creating}>
            {creating ? "Створення..." : "Створити програму"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="programs-empty">Завантаження...</div>
      ) : activePrograms.length === 0 ? (
        <div className="programs-empty">
          Активних програм конференцій поки немає.
        </div>
      ) : (
        <div className="programs-list">
          {activePrograms.map((program) => (
            <article key={program.id} className="program-card">
              <div className="program-card__top">
                <div>
                  <span
                    className={`program-card__status program-card__status--${program.status.toLowerCase()}`}
                  >
                    {getStatusLabel(program.status)}
                  </span>

                  <h2>{program.title}</h2>

                  <p>{program.description || "Опис програми ще не додано."}</p>
                </div>
              </div>

              <div className="program-card__meta">
                <span>
                  <CalendarDays size={16} />
                  {formatDate(program.startDate)}
                </span>

                <span>
                  <Users size={16} />
                  Секцій: {program.sections?.length || 0}
                </span>
              </div>

              <div className="program-card__venue">
                Конференція:{" "}
                <strong>{program.venue?.title || "Без назви"}</strong>
              </div>

              <div className="program-card__actions">
                <Link to={`/programs/${program.id}`}>
                  Переглянути програму <ExternalLink size={15} />
                </Link>

                {isCommittee && program.status === "DRAFT" && (
                  <button
                    type="button"
                    disabled={actionLoadingId === program.id}
                    onClick={() => handlePublish(program.id)}
                  >
                    Опублікувати
                  </button>
                )}

                {isCommittee && (
                  <button
                    type="button"
                    disabled={actionLoadingId === program.id}
                    onClick={() => handleSendInvitations(program.id)}
                  >
                    <Send size={15} />
                    Запрошення
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}