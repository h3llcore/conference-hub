import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarDays, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getConferencePrograms } from "../features/programs/programs.api";
import type { ConferenceProgram } from "../types/programs.types";
import "../styles/programs.css";

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

export default function ProgramsArchivePage() {
  const [programs, setPrograms] = useState<ConferenceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await getConferencePrograms();
        setPrograms(data.programs || []);
      } catch (e: any) {
        setError(e.message || "Не вдалося завантажити архів конференцій.");
      } finally {
        setLoading(false);
      }
    }

    loadPrograms();
  }, []);

  const archivedPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (program.status === "FINISHED" || program.status === "ARCHIVED") {
        return true;
      }

      if (program.endDate && new Date(program.endDate) < new Date()) {
        return true;
      }

      return false;
    });
  }, [programs]);

  return (
    <section className="programs-page">
      <div className="programs-page__header">
        <div>
          <p className="programs-page__eyebrow">Conference Hub</p>
          <h1>Архів конференцій</h1>
          <p>
            Тут відображаються завершені конференції та їхні опубліковані
            програми.
          </p>
        </div>
      </div>

      {error && <div className="programs-alert programs-alert--error">{error}</div>}

      {loading ? (
        <div className="programs-empty">Завантаження архіву...</div>
      ) : archivedPrograms.length === 0 ? (
        <div className="programs-empty">Архів конференцій поки порожній.</div>
      ) : (
        <div className="programs-list">
          {archivedPrograms.map((program) => (
            <article key={program.id} className="program-card">
              <div className="program-card__top">
                <div>
                  <span className="program-card__status program-card__status--finished">
                    <Archive size={13} />
                    Завершено
                  </span>

                  <h2>{program.title}</h2>
                  <p>{program.description || "Опис програми не додано."}</p>
                </div>
              </div>

              <div className="program-card__meta">
                <span>
                  <CalendarDays size={16} />
                  {formatDate(program.startDate)}
                </span>

                <span>Конференція: {program.venue?.title || "Без назви"}</span>
              </div>

              <div className="program-card__actions">
                <Link to={`/programs/${program.id}`}>
                  Переглянути програму <ExternalLink size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}