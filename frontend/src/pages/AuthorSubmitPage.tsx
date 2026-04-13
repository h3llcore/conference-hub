import { FileText, Info, Upload } from "lucide-react";
import { useState } from "react";
import "../styles/author-submit.css";

type SubmitForm = {
  title: string;
  abstract: string;
  keywords: string;
  venueType: "journal" | "conference";
  venue: string;
  coAuthors: string;
  notes: string;
};

const initialForm: SubmitForm = {
  title: "",
  abstract: "",
  keywords: "",
  venueType: "journal",
  venue: "",
  coAuthors: "",
  notes: "",
};

export default function AuthorSubmitPage() {
  const [form, setForm] = useState<SubmitForm>(initialForm);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.abstract.trim() ||
      !form.keywords.trim() ||
      !form.venue.trim()
    ) {
      setMessage("Будь ласка, заповніть обов’язкові поля.");
      return;
    }

    setMessage("Чернетку подання успішно підготовлено.");
  }

  return (
    <section className="author-submit">
      <div className="author-submit__hero">
        <div className="author-submit__hero-content">
          <p className="author-submit__eyebrow">Подання матеріалів</p>
          <h1 className="author-submit__title">Завантаження нової роботи</h1>
          <p className="author-submit__description">
            Заповніть основну інформацію про наукову роботу, оберіть журнал або
            конференцію та додайте файл для подання.
          </p>
        </div>
      </div>

      <div className="author-submit__layout">
        <main className="author-submit__main">
          <form className="author-submit__card" onSubmit={handleSubmit}>
            <div className="author-submit__card-header">
              <h2>Форма подання</h2>
              <p>Усі поля з "*" є обов’язковими.</p>
            </div>

            {message && <div className="author-submit__message">{message}</div>}

            <div className="author-submit__field">
              <label htmlFor="title">Назва роботи *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Введіть назву роботи"
              />
            </div>

            <div className="author-submit__field">
              <label htmlFor="abstract">Анотація *</label>
              <textarea
                id="abstract"
                name="abstract"
                value={form.abstract}
                onChange={handleChange}
                placeholder="Коротко опишіть зміст роботи"
                rows={6}
              />
            </div>

            <div className="author-submit__row">
              <div className="author-submit__field">
                <label htmlFor="keywords">Ключові слова *</label>
                <input
                  id="keywords"
                  name="keywords"
                  type="text"
                  value={form.keywords}
                  onChange={handleChange}
                  placeholder="ШІ, освіта, цифрові технології"
                />
              </div>

              <div className="author-submit__field">
                <label htmlFor="coAuthors">Співавтори</label>
                <input
                  id="coAuthors"
                  name="coAuthors"
                  type="text"
                  value={form.coAuthors}
                  onChange={handleChange}
                  placeholder="Перелічіть співавторів"
                />
              </div>
            </div>

            <div className="author-submit__row">
              <div className="author-submit__field">
                <label htmlFor="venueType">Тип подання *</label>
                <select
                  id="venueType"
                  name="venueType"
                  value={form.venueType}
                  onChange={handleChange}
                >
                  <option value="journal">Науковий журнал</option>
                  <option value="conference">Конференція</option>
                </select>
              </div>

              <div className="author-submit__field">
                <label htmlFor="venue">Журнал / конференція *</label>
                <select
                  id="venue"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                >
                  <option value="">Оберіть варіант</option>
                  <option value="journal-1">Журнал комп’ютерних наук</option>
                  <option value="journal-2">Інформаційні системи та технології</option>
                  <option value="conference-1">Digital Science 2026</option>
                  <option value="conference-2">AI in Education Summit</option>
                </select>
              </div>
            </div>

            <div className="author-submit__field">
              <label htmlFor="notes">Примітки для редактора / оргкомітету</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="За потреби додайте коментар"
                rows={4}
              />
            </div>

            <div className="author-submit__field">
              <label htmlFor="file">Файл роботи *</label>

              <label className="author-submit__upload-box" htmlFor="file">
                <input id="file" type="file" hidden onChange={handleFileChange} />
                <div className="author-submit__upload-icon">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="author-submit__upload-title">
                    {fileName || "Натисніть, щоб вибрати файл"}
                  </p>
                  <span className="author-submit__upload-hint">
                    Підтримувані формати: PDF, DOCX
                  </span>
                </div>
              </label>
            </div>

            <div className="author-submit__actions">
              <button type="button" className="author-submit__button author-submit__button--secondary">
                Зберегти як чернетку
              </button>
              <button type="submit" className="author-submit__button author-submit__button--primary">
                Надіслати роботу
              </button>
            </div>
          </form>
        </main>

        <aside className="author-submit__sidebar">
          <div className="author-submit__info-card">
            <div className="author-submit__info-header">
              <Info size={18} />
              <h3>Поради перед поданням</h3>
            </div>
            <ul>
              <li>Перевірте правильність назви та анотації.</li>
              <li>Переконайтеся, що файл оформлено за вимогами.</li>
              <li>Уточніть дедлайн подання для обраного видання.</li>
            </ul>
          </div>

          <div className="author-submit__info-card">
            <div className="author-submit__info-header">
              <FileText size={18} />
              <h3>Структура матеріалу</h3>
            </div>
            <ul>
              <li>Назва роботи</li>
              <li>Анотація</li>
              <li>Ключові слова</li>
              <li>Основний файл статті</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}