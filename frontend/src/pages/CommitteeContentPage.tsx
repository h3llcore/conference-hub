import { useEffect, useState } from "react";
import {
  apiCreateHomeContent,
  apiDeleteHomeContent,
  apiGetAdminHomeContent,
  type HomeContent,
  type HomeContentType,
} from "../features/home/home.api";
import { createVenue, getVenues, type Venue } from "../features/venues/venues.api";

import "../styles/committee-content.css";

type ContentKind = "NEWS" | "JOURNAL" | "CONFERENCE";

type ContentForm = {
  type: ContentKind;
  title: string;
  description: string;
  deadline: string;
  date: string;
};

const initialForm: ContentForm = {
  type: "NEWS",
  title: "",
  description: "",
  deadline: "",
  date: "",
};

export default function CommitteeContentPage() {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ContentForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isNews = form.type === "NEWS";
  const isJournal = form.type === "JOURNAL";
  const isConference = form.type === "CONFERENCE";

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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "type") {
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
      if (isNews) {
        await apiCreateHomeContent({
          type: "NEWS",
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date || undefined,
          isPublished: true,
        });

        setSuccess("Новину успішно створено.");
      }

      if (isJournal || isConference) {
        await createVenue({
          type: form.type as "JOURNAL" | "CONFERENCE",
          title: form.title.trim(),
          description: form.description.trim(),
          deadline: form.deadline,
        });

        setSuccess(
          isJournal ? "Науковий журнал успішно створено." : "Конференцію успішно створено."
        );
      }

      setForm(initialForm);
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося створити запис.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Видалити запис?")) {
      return;
    }

    try {
      await apiDeleteHomeContent(id);
      await loadData();
    } catch (e: any) {
      setError(e.message || "Не вдалося видалити запис.");
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
            Створюйте новини, наукові журнали та конференції. Новини відображаються на головній
            сторінці, а журнали й конференції додаються до загального каталогу платформи.
          </p>
        </div>

        <form className="committee-content-form" onSubmit={handleSubmit}>
          {error && <div className="committee-content-form__error">{error}</div>}

          {success && <div className="committee-content-form__success">{success}</div>}

          <div className="committee-content-form__grid">
            <label>
              Тип запису
              <select name="type" value={form.type} onChange={handleChange}>
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
            {isNews ? "Заголовок новини" : isJournal ? "Назва журналу" : "Назва конференції"}

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
            {isNews ? "Текст новини" : isJournal ? "Опис журналу" : "Опис конференції"}

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

          <button type="submit" className="committee-content-form__submit">
            {isNews ? "Створити новину" : isJournal ? "Створити журнал" : "Створити конференцію"}
          </button>
        </form>

        <div className="committee-content-list">
          {loading ? (
            <div className="committee-content-list__empty">Завантаження...</div>
          ) : (
            <>
              <div className="committee-content-section">
                <h2>Новини та оголошення</h2>

                {items.length === 0 ? (
                  <div className="committee-content-list__empty">Новин поки немає</div>
                ) : (
                  items.map((item) => (
                    <article key={item.id} className="committee-content-card">
                      <div className="committee-content-card__top">
                        <span className="committee-content-card__type">
                          {getTypeLabel(item.type)}
                        </span>

                        <button type="button" onClick={() => handleDelete(item.id)}>
                          Видалити
                        </button>
                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.description}</p>

                      {item.date && (
                        <span className="committee-content-card__meta">
                          {new Date(item.date).toLocaleString("uk-UA")}
                        </span>
                      )}
                    </article>
                  ))
                )}
              </div>

              <div className="committee-content-section">
                <h2>Журнали та конференції</h2>

                {venues.length === 0 ? (
                  <div className="committee-content-list__empty">
                    Журналів і конференцій поки немає
                  </div>
                ) : (
                  venues.map((venue) => (
                    <article key={venue.id} className="committee-content-card">
                      <div className="committee-content-card__top">
                        <span className="committee-content-card__type">
                          {getVenueTypeLabel(venue.type)}
                        </span>
                      </div>

                      <h3>{venue.title}</h3>

                      <p>{venue.description}</p>

                      <span className="committee-content-card__meta">
                        Дедлайн: {new Date(venue.deadline).toLocaleString("uk-UA")}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
