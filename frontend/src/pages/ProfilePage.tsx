import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, LinkIcon, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { ProfilePayload } from "../types/auth.types";
import "../styles/profile.css";

const emptyProfile: ProfilePayload = {
  firstName: "",
  lastName: "",
  institution: "",
  country: "",
  academicDegree: "",
  academicTitle: "",
  orcid: "",
  googleScholarUrl: "",
  bio: "",
};

export default function ProfilePage() {
  const { user, updateProfile, connectOrcid } = useAuth();
  const [params] = useSearchParams();

  const [form, setForm] = useState<ProfilePayload>(emptyProfile);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [orcidLoading, setOrcidLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      institution: user.institution || "",
      country: user.country || "",
      academicDegree: user.academicDegree || "",
      academicTitle: user.academicTitle || "",
      orcid: user.orcid || "",
      googleScholarUrl: user.googleScholarUrl || "",
      bio: user.bio || "",
    });
  }, [user]);

  useEffect(() => {
    const orcidStatus = params.get("orcid");

    if (orcidStatus === "connected") {
      setSuccess("ORCID успішно підключено та підтверджено.");
    }

    if (orcidStatus === "already_connected") {
      setError("Цей ORCID уже підключено до іншого користувача.");
    }
  }, [params]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.institution.trim() ||
      !form.country.trim()
    ) {
      setError("Заповніть ім’я, прізвище, установу та країну.");
      return;
    }

    if (
      form.orcid?.trim() &&
      !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(
        form.orcid.replace("https://orcid.org/", "").trim(),
      )
    ) {
      setError("ORCID потрібно ввести у форматі 0000-0000-0000-0000.");
      return;
    }

    try {
      setLoading(true);

      await updateProfile({
        ...form,
        orcid: form.orcid?.replace("https://orcid.org/", "").trim() || "",
      });

      setSuccess("Профіль успішно оновлено.");
    } catch (e: any) {
      setError(e.message || "Не вдалося оновити профіль.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectOrcid() {
    try {
      setOrcidLoading(true);
      setError("");
      await connectOrcid();
    } catch (e: any) {
      setError(e.message || "Не вдалося підключити ORCID.");
      setOrcidLoading(false);
    }
  }

  const cleanOrcid = form.orcid?.replace("https://orcid.org/", "").trim();
  const orcidUrl = cleanOrcid ? `https://orcid.org/${cleanOrcid}` : "";

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-card__header">
          <div>
            <h1>Профіль користувача</h1>
            <p>
              Особисті та наукові дані автора, рецензента або члена
              оргкомітету.
            </p>
          </div>

          {user && <span className="profile-card__role">{user.role}</span>}
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="profile-form__error">{error}</div>}
          {success && <div className="profile-form__success">{success}</div>}

          <div className="profile-form__row">
            <label>
              Ім’я
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </label>

            <label>
              Прізвище
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="profile-form__row">
            <label>
              Наукова установа
              <input
                name="institution"
                value={form.institution}
                onChange={handleChange}
              />
            </label>

            <label>
              Країна
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="profile-form__row">
            <label>
              Науковий ступінь
              <input
                name="academicDegree"
                value={form.academicDegree}
                onChange={handleChange}
                placeholder="доктор філософії, канд. наук тощо"
              />
            </label>

            <label>
              Вчене звання
              <input
                name="academicTitle"
                value={form.academicTitle}
                onChange={handleChange}
                placeholder="доцент, професор тощо"
              />
            </label>
          </div>

          <div className="profile-form__row">
            <label>
              ORCID iD
              <input
                name="orcid"
                value={form.orcid}
                onChange={handleChange}
                placeholder="0000-0000-0000-0000"
              />

              <div className="profile-form__links">
                {orcidUrl && (
                  <a
                    className="profile-form__link"
                    href={orcidUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Переглянути ORCID <ExternalLink size={14} />
                  </a>
                )}

                {user?.orcidVerified && (
                  <span className="profile-form__verified">
                    <CheckCircle2 size={14} />
                    ORCID підтверджено
                  </span>
                )}
              </div>
            </label>

            <label>
              Google Scholar
              <input
                name="googleScholarUrl"
                value={form.googleScholarUrl}
                onChange={handleChange}
                placeholder="https://scholar.google.com/citations?user=..."
              />

              {form.googleScholarUrl && (
                <a
                  className="profile-form__link"
                  href={form.googleScholarUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Переглянути профіль <ExternalLink size={14} />
                </a>
              )}
            </label>
          </div>

          <label>
            Наукові інтереси / коротка інформація
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              placeholder="Коротко опишіть напрям досліджень"
            />
          </label>

          <div className="profile-form__actions">
            <button
              className="profile-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти профіль"}
            </button>

            <button
              className="profile-form__orcid"
              type="button"
              disabled={orcidLoading}
              onClick={handleConnectOrcid}
            >
              <ShieldCheck size={16} />
              {orcidLoading ? "Переадресація..." : "Підключити ORCID"}
            </button>
          </div>
        </form>

        <div className="profile-card__note">
          <LinkIcon size={17} />
          ORCID можна ввести вручну або підтвердити через офіційний OAuth-вхід.
        </div>
      </div>
    </section>
  );
}