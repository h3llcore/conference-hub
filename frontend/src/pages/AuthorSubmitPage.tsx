import { FileText, Info, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/author-submit.css";
import {
  createSubmission,
  getSubmissionById,
  updateSubmission,
} from "../features/submissions/submissions.api";
import { getVenues } from "../features/venues/venues.api";

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
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "REVISION_REQUIRED"
    | "RESUBMITTED"
    | "ACCEPTED"
    | "REJECTED"
    | "PUBLISHED";
  version: number;
};

type Venue = {
  id: string;
  title: string;
  description?: string;
  type: "JOURNAL" | "CONFERENCE";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [currentVersion, setCurrentVersion] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    async function loadVenuesList() {
      try {
        setVenuesLoading(true);
        const data = await getVenues();
        const items = data.venues || [];

        if (isMounted) {
          setVenues(items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setVenuesLoading(false);
        }
      }
    }

    loadVenuesList();

    return () => {
      isMounted = false;
    };
  }, []);

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
        setSelectedFile(null);
        setCurrentStatus(submission.status || "");
        setCurrentVersion(submission.version || 1);
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
      ...(name === "venueType" ? { venue: "" } : {}),
    }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);

    if (file) {
      setFileName(file.name);
    }
  }

  function buildPayload(status: "DRAFT" | "SUBMITTED" | "RESUBMITTED") {
    const formData = new FormData();

    formData.append("title", form.title.trim());
    formData.append("abstract", form.abstract.trim());
    formData.append("keywords", form.keywords.trim());
    formData.append("venueType", form.venueType === "journal" ? "JOURNAL" : "CONFERENCE");
    formData.append("venue", form.venue);
    formData.append("coAuthors", form.coAuthors.trim());
    formData.append("notes", form.notes.trim());
    formData.append("status", status);

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (fileName) {
      formData.append("fileName", fileName);
    }

    return formData;
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

    if (!isEditMode && !selectedFile) {
      setError("Будь ласка, додайте файл роботи.");
      return false;
    }

    if (isEditMode && !fileName && !selectedFile) {
      setError("Будь ласка, додайте файл роботи.");
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

      const submitStatus =
        isEditMode && currentStatus === "REVISION_REQUIRED" ? "RESUBMITTED" : "SUBMITTED";

      const payload = buildPayload(submitStatus);

      if (isEditMode && id) {
        await updateSubmission(id, payload);
        setSuccess(
          submitStatus === "RESUBMITTED"
            ? "Виправлену версію успішно подано повторно."
            : "Подання успішно оновлено."
        );
      } else {
        await createSubmission(payload);
        setSuccess("Роботу успішно подано.");
        setForm(initialForm);
        setFileName("");
        setSelectedFile(null);
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

      const payload = buildPayload("DRAFT");

      if (isEditMode && id) {
        await updateSubmission(id, payload);
        setSuccess("Чернетку успішно оновлено.");
      } else {
        await createSubmission(payload);
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

  const filteredVenues = venues.filter((item) =>
    form.venueType === "journal" ? item.type === "JOURNAL" : item.type === "CONFERENCE"
  );

  const isRevisionMode = isEditMode && currentStatus === "REVISION_REQUIRED";

  return (
    <section className="author-submit">
      <div className="author-submit__hero">
        <div className="author-submit__hero-content">
          <p className="author-submit__eyebrow">Подання матеріалів</p>
          <h1 className="author-submit__title">
            {isRevisionMode
              ? "Повторне подання виправленої статті"
              : isEditMode
                ? "Редагування подання"
                : "Завантаження нової роботи"}
          </h1>
          <p className="author-submit__description">
            {isRevisionMode
              ? `Ваша стаття потребує доопрацювання. Після повторного подання буде створено версію ${currentVersion + 1}.`
              : isEditMode
                ? "Оновіть інформацію про наукову роботу, змініть файл або збережіть її як чернетку."
                : "Заповніть основну інформацію про наукову роботу, оберіть журнал або конференцію та додайте файл для подання."}
          </p>

          <button
            type="button"
            className="author-submit__back-link"
            onClick={() => navigate("/author")}
          >
            ← Назад до кабінету автора
          </button>
        </div>
      </div>

      <div className="author-submit__layout">
        <main className="author-submit__main">
          <form className="author-submit__card" onSubmit={handleSubmit}>
            <div className="author-submit__card-header">
              <h2>
                {isRevisionMode
                  ? "Форма повторного подання"
                  : isEditMode
                    ? "Редагування форми"
                    : "Форма подання"}
              </h2>
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
                    <select
                      id="venue"
                      name="venue"
                      value={form.venue}
                      onChange={handleChange}
                      disabled={venuesLoading}
                    >
                      <option value="">
                        {venuesLoading ? "Завантаження..." : "Оберіть варіант"}
                      </option>

                      {filteredVenues.map((item) => (
                        <option key={item.id} value={item.title}>
                          {item.title}
                        </option>
                      ))}
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
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      hidden
                      onChange={handleFileChange}
                    />
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
                      : isRevisionMode
                        ? "Подати виправлену версію"
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
              <FileText size={18} />
              <h3>Правила оформлення</h3>
            </div>

            <ul>
              <li>Файл має бути у форматі PDF або DOCX.</li>
              <li>Обов’язково вкажіть назву, анотацію та ключові слова.</li>
              <li>Перевірте структуру статті перед поданням.</li>
              <li>Дотримуйтеся вимог обраного журналу або конференції.</li>
            </ul>

            <a
              className="author-submit__template-button"
              href="/templates/article-template.docx"
              download
            >
              Завантажити шаблон
            </a>
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
        </aside>
      </div>
    </section>
  );
}
