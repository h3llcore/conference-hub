import { useEffect, useState } from "react";
import {
  apiCreateHomeContent,
  apiDeleteHomeContent,
  apiGetAdminHomeContent,
  type HomeContent,
  type HomeContentType,
} from "../features/home/home.api";

import "../styles/committee-content.css";

type ContentForm = {
  type: Exclude<HomeContentType, "ARTICLE">;
  title: string;
  description: string;
  linkUrl: string;
  rating: string;
  date: string;
};

const initialForm: ContentForm = {
  type: "NEWS",
  title: "",
  description: "",
  linkUrl: "",
  rating: "",
  date: "",
};

export default function CommitteeContentPage() {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ContentForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isNews = form.type === "NEWS";
  const isJournal = form.type === "JOURNAL";

  async function loadContent() {
    try {
      setLoading(true);
      setError("");

      const data = await apiGetAdminHomeContent();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e.message || "Не вдалося завантажити контент.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "type") {
        return {
          ...initialForm,
          type: value as Exclude<HomeContentType, "ARTICLE">,
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
      setError("Заповніть заголовок та опис.");
      return;
    }

    if (isJournal && !form.linkUrl.trim()) {
      setError("Для журналу бажано вказати посилання на сторінку журналу.");
      return;
    }

    try {
      await apiCreateHomeContent({
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        linkUrl: isJournal ? form.linkUrl.trim() || undefined : undefined,
        rating: isJournal && form.rating ? Number(form.rating) : undefined,
        date: form.date || undefined,
      });

      setSuccess("Контент успішно створено.");
      setForm(initialForm);
      await loadContent();
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
      await loadContent();
    } catch (e: any) {
      setError(e.message || "Не вдалося видалити запис.");
    }
  }

  function getTypeLabel(type: HomeContentType) {
    if (type === "NEWS") return "Новина";
    if (type === "ARTICLE") return "Опублікована стаття";
    return "Журнал";
  }

  return (
    <section className="committee-content-page">
      <div className="committee-content-page__container">
        <div className="committee-content-page__header">
          <h1>Керування головною сторінкою</h1>

          <p>
            Додавання новин та журналів для головної сторінки. Популярні статті
            потрапляють на головну автоматично після публікації прийнятої роботи.
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
              Тип контенту
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="NEWS">Новина</option>
                <option value="JOURNAL">Науковий журнал</option>
              </select>
            </label>

            <label>
              Дата
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            {isNews ? "Заголовок новини" : "Назва журналу"}
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={
                isNews
                  ? "Наприклад: Оновлено каталог конференцій"
                  : "Наприклад: Journal of Digital Science"
              }
            />
          </label>

          <label>
            {isNews ? "Текст новини" : "Опис журналу"}
            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={
                isNews
                  ? "Коротко опишіть новину або оголошення"
                  : "Коротко опишіть журнал, напрям, умови подання"
              }
            />
          </label>

          {isJournal && (
            <div className="committee-content-form__grid">
              <label>
                Рейтинг журналу
                <input
                  type="number"
                  step="0.1"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="4.9"
                />
              </label>

              <label>
                Посилання на журнал
                <input
                  name="linkUrl"
                  value={form.linkUrl}
                  onChange={handleChange}
                  placeholder="/journals або /journals/123"
                />
              </label>
            </div>
          )}

          <button type="submit" className="committee-content-form__submit">
            Створити запис
          </button>
        </form>

        <div className="committee-content-list">
          {loading ? (
            <div className="committee-content-list__empty">Завантаження...</div>
          ) : items.length === 0 ? (
            <div className="committee-content-list__empty">
              Контент поки відсутній
            </div>
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

                {item.authorName && (
                  <span className="committee-content-card__meta">
                    Автор: {item.authorName}
                  </span>
                )}

                {item.rating && (
                  <span className="committee-content-card__meta">
                    Рейтинг: {item.rating}
                  </span>
                )}

                {item.linkUrl && (
                  <span className="committee-content-card__meta">
                    Посилання: {item.linkUrl}
                  </span>
                )}

                {item.date && (
                  <span className="committee-content-card__meta">
                    {new Date(item.date).toLocaleString("uk-UA")}
                  </span>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}