import { useEffect, useMemo, useState } from "react";
import {
  apiCreateHomeContent,
  apiDeleteHomeContent,
  apiGetAdminHomeContent,
  apiUpdateHomeContent,
  type HomeContent,
  type HomeContentType,
} from "../features/home/home.api";
import {
  createVenue,
  deleteVenue,
  getVenues,
  updateVenue,
  type Venue,
} from "../features/venues/venues.api";

import "../styles/committee-content.css";

type ContentKind = "NEWS" | "JOURNAL" | "CONFERENCE";

type ContentForm = {
  type: ContentKind;
  title: string;
  description: string;
  deadline: string;
  date: string;
};

type EditingTarget =
  | { kind: "NEWS"; id: string }
  | { kind: "VENUE"; id: string; venueType: "JOURNAL" | "CONFERENCE" }
  | null;

const initialForm: ContentForm = {
  type: "NEWS",
  title: "",
  description: "",
  deadline: "",
  date: "",
};

const INITIAL_VISIBLE_COUNT = 4;

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function CommitteeContentPage() {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ContentForm>(initialForm);
  const [editing, setEditing] = useState<EditingTarget>(null);

  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleVenuesCount, setVisibleVenuesCount] =
    useState(INITIAL_VISIBLE_COUNT);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isNews = form.type === "NEWS";
  const isJournal = form.type === "JOURNAL";
  const isConference = form.type === "CONFERENCE";
  const isEditing = Boolean(editing);

  const visibleItems = useMemo(
    () => items.slice(0, visibleNewsCount),
    [items, visibleNewsCount],
  );

  const visibleVenues = useMemo(
    () => venues.slice(0, visibleVenuesCount),
    [venues, visibleVenuesCount],
  );

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [contentData, venuesData] = await Promise.all([
        apiGetAdminHomeContent(),
        getVenues({ sort: "newest" }),
      ]);

      setItems(contentData.items || []);
      setVenues(venuesData.venues || []);
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
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "type") {
        setEditing(null);

        return {
          ...initialForm,
          type: value as ContentKind,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function resetForm() {
    setForm(initialForm);
    setEditing(null);
  }

  function handleEditNews(item: HomeContent) {
    setEditing({ kind: "NEWS", id: item.id });

    setForm({
      type: "NEWS",
      title: item.title || "",
      description: item.description || "",
      date: toDateTimeLocal(item.date || item.createdAt),
      deadline: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditVenue(venue: Venue) {
    setEditing({
      kind: "VENUE",
      id: venue.id,
      venueType: venue.type,
    });

    setForm({
      type: venue.type,
      title: venue.title || "",
      description: venue.description || "",
      deadline: toDateTimeLocal(venue.deadline),
      date: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Заповніть назву та опис.");
      return;
    }

    if ((isJournal || isConference) && !form.deadline) {
      setError("Для журналу або конференції потрібно вказати дедлайн.");
      return;
    }

    if (isNews && !form.date) {
      setError("Для новини потрібно вказати дату.");
      return;
    }

    try {
      if (editing?.kind === "NEWS") {
        await apiUpdateHomeContent(editing.id, {
          type: "NEWS",
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          isPublished: true,
        });

        setSuccess("Новину успішно оновлено.");
      } else if (editing?.kind === "VENUE") {
        await updateVenue(editing.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          deadline: form.deadline,
        });

        setSuccess(
          editing.venueType === "JOURNAL"
            ? "Науковий журнал успішно оновлено."
            : "Конференцію успішно оновлено.",
        );
      } else if (isNews) {
        await apiCreateHomeContent({
          type: "NEWS",
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date || undefined,
          isPublished: true,
        });

        setSuccess("Новину успішно створено.");
      } else {
        await createVenue({
          type: form.type as "JOURNAL" | "CONFERENCE",
          title: form.title.trim(),
          description: form.description.trim(),
          deadline: form.deadline,
        });

        setSuccess(
          isJournal
            ? "Науковий журнал успішно створено."
            : "Конференцію успішно створено.",
        );
      }

      resetForm();
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося зберегти запис.");
    }
  }

  async function handleDeleteNews(id: string) {
    if (!window.confirm("Видалити новину?")) return;

    try {
      await apiDeleteHomeContent(id);
      setSuccess("Новину видалено.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося видалити новину.");
    }
  }

  async function handleDeleteVenue(id: string, type: "JOURNAL" | "CONFERENCE") {
    const label = type === "JOURNAL" ? "журнал" : "конференцію";

    if (!window.confirm(`Видалити ${label}?`)) return;

    try {
      await deleteVenue(id);
      setSuccess(
        type === "JOURNAL" ? "Журнал видалено." : "Конференцію видалено.",
      );
      await loadData();
    } catch (e: any) {
      setError(e.message || `Не вдалося видалити ${label}.`);
    }
  }

  function getTypeLabel(type: HomeContentType) {
    if (type === "NEWS") return "Новина";
    if (type === "ARTICLE") return "Опублікована стаття";
    return "Журнал";
  }

  function getVenueTypeLabel(type: "JOURNAL" | "CONFERENCE") {
    return type === "JOURNAL" ? "Науковий журнал" : "Конференція";
  }

  return (
    <section className="committee-content-page">
      <div className="committee-content-page__container">
        <div className="committee-content-page__header">
          <h1>Керування контентом платформи</h1>

          <p>
            Створюйте новини, наукові журнали та конференції. Новини
            відображаються на головній сторінці, а журнали й конференції
            додаються до загального каталогу платформи.
          </p>
        </div>

        <form className="committee-content-form" onSubmit={handleSubmit}>
          {error && (
            <div className="committee-content-form__error">{error}</div>
          )}

          {success && (
            <div className="committee-content-form__success">{success}</div>
          )}

          <div className="committee-content-form__grid">
            <label>
              Тип запису
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={isEditing}
              >
                <option value="NEWS">Новина</option>
                <option value="JOURNAL">Науковий журнал</option>
                <option value="CONFERENCE">Конференція</option>
              </select>
            </label>

            {isNews ? (
              <label>
                Дата новини
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>
            ) : (
              <label>
                Дедлайн подання матеріалів
                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </label>
            )}
          </div>

          <label>
            {isNews
              ? "Заголовок новини"
              : isJournal
                ? "Назва журналу"
                : "Назва конференції"}

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={
                isNews
                  ? "Наприклад: Оновлено каталог конференцій"
                  : isJournal
                    ? "Наприклад: Journal of Digital Science"
                    : "Наприклад: International Conference on AI 2026"
              }
            />
          </label>

          <label>
            {isNews
              ? "Текст новини"
              : isJournal
                ? "Опис журналу"
                : "Опис конференції"}

            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={
                isNews
                  ? "Коротко опишіть новину або оголошення"
                  : isJournal
                    ? "Коротко опишіть журнал, напрям, умови подання"
                    : "Коротко опишіть конференцію, тематику, умови участі"
              }
            />
          </label>

          <div className="committee-content-form__actions">
            <button type="submit" className="committee-content-form__submit">
              {isEditing
                ? "Зберегти зміни"
                : isNews
                  ? "Створити новину"
                  : isJournal
                    ? "Створити журнал"
                    : "Створити конференцію"}
            </button>

            {isEditing && (
              <button
                type="button"
                className="committee-content-form__cancel"
                onClick={resetForm}
              >
                Скасувати
              </button>
            )}
          </div>
        </form>

        <div className="committee-content-list">
          {loading ? (
            <div className="committee-content-list__empty">Завантаження...</div>
          ) : (
            <>
              <div className="committee-content-section">
                <h2>Новини та оголошення</h2>

                {items.length === 0 ? (
                  <div className="committee-content-list__empty">
                    Новин поки немає
                  </div>
                ) : (
                  <>
                    {visibleItems.map((item) => (
                      <article key={item.id} className="committee-content-card">
                        <div className="committee-content-card__top">
                          <span className="committee-content-card__type">
                            {getTypeLabel(item.type)}
                          </span>

                          <div className="committee-content-card__actions">
                            <button
                              type="button"
                              className="committee-content-card__edit"
                              onClick={() => handleEditNews(item)}
                            >
                              Редагувати
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item.id)}
                            >
                              Видалити
                            </button>
                          </div>
                        </div>

                        <h3>{item.title}</h3>

                        <p>{item.description}</p>

                        {item.date && (
                          <span className="committee-content-card__meta">
                            {new Date(item.date).toLocaleString("uk-UA")}
                          </span>
                        )}
                      </article>
                    ))}

                    {visibleNewsCount < items.length && (
                      <button
                        type="button"
                        className="committee-content-list__more"
                        onClick={() =>
                          setVisibleNewsCount((prev) => prev + INITIAL_VISIBLE_COUNT)
                        }
                      >
                        Показати ще
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="committee-content-section">
                <h2>Журнали та конференції</h2>

                {venues.length === 0 ? (
                  <div className="committee-content-list__empty">
                    Журналів і конференцій поки немає
                  </div>
                ) : (
                  <>
                    {visibleVenues.map((venue) => (
                      <article key={venue.id} className="committee-content-card">
                        <div className="committee-content-card__top">
                          <span className="committee-content-card__type">
                            {getVenueTypeLabel(venue.type)}
                          </span>

                          <div className="committee-content-card__actions">
                            <button
                              type="button"
                              className="committee-content-card__edit"
                              onClick={() => handleEditVenue(venue)}
                            >
                              Редагувати
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteVenue(venue.id, venue.type)
                              }
                            >
                              Видалити
                            </button>
                          </div>
                        </div>

                        <h3>{venue.title}</h3>

                        <p>{venue.description}</p>

                        <span className="committee-content-card__meta">
                          Дедлайн:{" "}
                          {new Date(venue.deadline).toLocaleString("uk-UA")}
                        </span>
                      </article>
                    ))}

                    {visibleVenuesCount < venues.length && (
                      <button
                        type="button"
                        className="committee-content-list__more"
                        onClick={() =>
                          setVisibleVenuesCount(
                            (prev) => prev + INITIAL_VISIBLE_COUNT,
                          )
                        }
                      >
                        Показати ще
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}