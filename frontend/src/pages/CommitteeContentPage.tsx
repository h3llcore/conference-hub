import { useEffect, useState } from "react";
import {
  apiCreateHomeContent,
  apiDeleteHomeContent,
  apiGetAdminHomeContent,
  type HomeContent,
  type HomeContentType,
} from "../features/home/home.api";

import "../styles/committee-content.css";

const initialForm = {
  type: "NEWS" as HomeContentType,
  title: "",
  description: "",
  authorName: "",
  linkUrl: "",
  imageUrl: "",
  rating: "",
  date: "",
};

export default function CommitteeContentPage() {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadContent() {
    try {
      setLoading(true);

      const data = await apiGetAdminHomeContent();

      setItems(data.items);
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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Заповніть заголовок та опис.");
      return;
    }

    try {
      await apiCreateHomeContent({
        type: form.type,
        title: form.title,
        description: form.description,
        authorName: form.authorName || undefined,
        linkUrl: form.linkUrl || undefined,
        imageUrl: form.imageUrl || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
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
    if (type === "ARTICLE") return "Стаття";
    return "Журнал";
  }

  return (
    <section className="committee-content-page">
      <div className="committee-content-page__container">
        <div className="committee-content-page__header">
          <h1>Керування головною сторінкою</h1>

          <p>
            Додавання новин, популярних статей та журналів для головної
            сторінки.
          </p>
        </div>

        <form
          className="committee-content-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="committee-content-form__error">
              {error}
            </div>
          )}

          {success && (
            <div className="committee-content-form__success">
              {success}
            </div>
          )}

          <div className="committee-content-form__grid">
            <label>
              Тип контенту

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="NEWS">Новина</option>
                <option value="ARTICLE">
                  Популярна стаття
                </option>
                <option value="JOURNAL">
                  Науковий журнал
                </option>
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
            Заголовок

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Введіть заголовок"
            />
          </label>

          <label>
            Опис

            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Введіть опис"
            />
          </label>

          <div className="committee-content-form__grid">
            <label>
              Автор / ініціали

              <input
                name="authorName"
                value={form.authorName}
                onChange={handleChange}
                placeholder="Наприклад: І. Коваль"
              />
            </label>

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
          </div>

          <label>
            Посилання

            <input
              name="linkUrl"
              value={form.linkUrl}
              onChange={handleChange}
              placeholder="/journals/123"
            />
          </label>

          <button
            type="submit"
            className="committee-content-form__submit"
          >
            Створити запис
          </button>
        </form>

        <div className="committee-content-list">
          {loading ? (
            <div className="committee-content-list__empty">
              Завантаження...
            </div>
          ) : items.length === 0 ? (
            <div className="committee-content-list__empty">
              Контент поки відсутній
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="committee-content-card"
              >
                <div className="committee-content-card__top">
                  <span className="committee-content-card__type">
                    {getTypeLabel(item.type)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                  >
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