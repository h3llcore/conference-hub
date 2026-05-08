import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, Plus, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  createConferenceProgram,
  getConferencePrograms,
  publishConferenceProgram,
  sendConferenceInvitations,
} from "../features/programs/programs.api";
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
  return status === "PUBLISHED" ? "Опубліковано" : "Чернетка";
}

export default function ProgramsPage() {
  const { user } = useAuth();

  const [programs, setPrograms] = useState<ConferenceProgram[]>([]);
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const isCommittee = user?.role === "COMMITTEE";

  async function loadPrograms() {
    try {
      setError("");
      const data = await getConferencePrograms();
      setPrograms(data.programs || []);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити програми конференцій.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.venueId.trim() || !form.title.trim() || !form.startDate) {
      setError("Вкажіть ID конференції, назву програми та дату початку.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await createConferenceProgram({
        venueId: form.venueId.trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        meetingUrl: form.meetingUrl.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });

      setForm(emptyForm);
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
      await publishConferenceProgram(programId);
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
      await sendConferenceInvitations(programId);
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

      {isCommittee && (
        <form className="programs-form" onSubmit={handleCreate}>
          <div className="programs-form__title">
            <Plus size={18} />
            <h2>Створити програму конференції</h2>
          </div>

          <div className="programs-form__grid">
            <label>
              ID конференції
              <input
                name="venueId"
                value={form.venueId}
                onChange={handleChange}
                placeholder="Встав ID конференції з бази"
              />
            </label>

            <label>
              Назва програми
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Програма конференції..."
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
      ) : programs.length === 0 ? (
        <div className="programs-empty">Поки що програми конференцій не створено.</div>
      ) : (
        <div className="programs-list">
          {programs.map((program) => (
            <article key={program.id} className="program-card">
              <div className="program-card__top">
                <div>
                  <span className={`program-card__status program-card__status--${program.status.toLowerCase()}`}>
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
                Конференція: <strong>{program.venue?.title || "Без назви"}</strong>
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