import { FileText, Info, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/author-submit.css";
import {
  createSubmission,
  getSubmissionById,
  updateSubmission,
} from "../features/submissions/submissions.api";

type SubmitForm = {
  title: string;
  abstract: string;
  keywords: string;
  venueType: "journal" | "conference";
  venue: string;
  coAuthors: string;
  notes: string;
};

type SubmissionResponse = {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  venueType: "JOURNAL" | "CONFERENCE";
  venue: string;
  coAuthors?: string | null;
  notes?: string | null;
  fileName?: string | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
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
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState<SubmitForm>(initialForm);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmission() {
      if (!id) return;

      try {
        setPageLoading(true);
        setError("");

        const data = await getSubmissionById(id);
        const submission: SubmissionResponse = data.submission;

        if (!isMounted) return;

        setForm({
          title: submission.title || "",
          abstract: submission.abstract || "",
          keywords: submission.keywords || "",
          venueType: submission.venueType === "JOURNAL" ? "journal" : "conference",
          venue: submission.venue || "",
          coAuthors: submission.coAuthors || "",
          notes: submission.notes || "",
        });

        setFileName(submission.fileName || "");
      } catch (e: any) {
        if (!isMounted) return;
        setError(e.message || "Не вдалося завантажити подання.");
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    }

    loadSubmission();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  function buildPayload(status: "DRAFT" | "SUBMITTED") {
    return {
      title: form.title.trim(),
      abstract: form.abstract.trim(),
      keywords: form.keywords.trim(),
      venueType: form.venueType === "journal" ? "JOURNAL" : "CONFERENCE",
      venue: form.venue,
      coAuthors: form.coAuthors.trim(),
      notes: form.notes.trim(),
      fileName: fileName || null,
      status,
    };
  }

  function validateRequiredFields() {
    if (
      !form.title.trim() ||
      !form.abstract.trim() ||
      !form.keywords.trim() ||
      !form.venue.trim()
    ) {
      setError("Будь ласка, заповніть обов’язкові поля.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateRequiredFields()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateSubmission(id, buildPayload("SUBMITTED"));
        setSuccess("Подання успішно оновлено.");
      } else {
        await createSubmission(buildPayload("SUBMITTED"));
        setSuccess("Роботу успішно подано.");
        setForm(initialForm);
        setFileName("");
      }

      setTimeout(() => {
        navigate("/author");
      }, 1200);
    } catch (e: any) {
      setError(
        e.message || (isEditMode ? "Не вдалося оновити подання." : "Не вдалося подати роботу.")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDraftSave() {
    setError("");
    setSuccess("");

    if (!validateRequiredFields()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateSubmission(id, buildPayload("DRAFT"));
        setSuccess("Чернетку успішно оновлено.");
      } else {
        await createSubmission(buildPayload("DRAFT"));
        setSuccess("Чернетку успішно збережено.");
      }
      setTimeout(() => {
        navigate("/author");
      }, 1200);
    } catch (e: any) {
      setError(
        e.message || (isEditMode ? "Не вдалося оновити чернетку." : "Не вдалося зберегти чернетку.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="author-submit">
      <div className="author-submit__hero">
        <div className="author-submit__hero-content">
          <p className="author-submit__eyebrow">Подання матеріалів</p>
          <h1 className="author-submit__title">
            {isEditMode ? "Редагування подання" : "Завантаження нової роботи"}
          </h1>
          <p className="author-submit__description">
            {isEditMode
              ? "Оновіть інформацію про наукову роботу, змініть файл або збережіть її як чернетку."
              : "Заповніть основну інформацію про наукову роботу, оберіть журнал або конференцію та додайте файл для подання."}
          </p>
        </div>
      </div>

      <div className="author-submit__layout">
        <main className="author-submit__main">
          <form className="author-submit__card" onSubmit={handleSubmit}>
            <div className="author-submit__card-header">
              <h2>{isEditMode ? "Редагування форми" : "Форма подання"}</h2>
              <p>Усі поля з "*" є обов’язковими.</p>
            </div>

            {pageLoading && <div className="form-success">Завантаження...</div>}
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            {!pageLoading && (
              <>
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
                    <select id="venue" name="venue" value={form.venue} onChange={handleChange}>
                      <option value="">Оберіть варіант</option>
                      <option value="Журнал комп’ютерних наук">Журнал комп’ютерних наук</option>
                      <option value="Інформаційні системи та технології">
                        Інформаційні системи та технології
                      </option>
                      <option value="Digital Science 2026">Digital Science 2026</option>
                      <option value="AI in Education Summit">AI in Education Summit</option>
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
                  <button
                    type="button"
                    className="author-submit__button author-submit__button--secondary"
                    onClick={handleDraftSave}
                    disabled={loading}
                  >
                    {loading
                      ? "Збереження..."
                      : isEditMode
                        ? "Оновити чернетку"
                        : "Зберегти як чернетку"}
                  </button>

                  <button
                    type="submit"
                    className="author-submit__button author-submit__button--primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Надсилання..."
                      : isEditMode
                        ? "Оновити подання"
                        : "Надіслати роботу"}
                  </button>
                </div>
              </>
            )}
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
