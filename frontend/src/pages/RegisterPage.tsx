import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useAuth } from "../features/auth/AuthContext";
import type { RegisterPayload, UserRole } from "../types/auth.types";

const initialForm: RegisterPayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  institution: "",
  country: "",
  role: "AUTHOR",
};

function getRedirectByRole(role: UserRole) {
  switch (role) {
    case "AUTHOR":
      return "/author";
    case "REVIEWER":
      return "/reviewer";
    case "COMMITTEE":
      return "/committee";
    default:
      return "/";
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function togglePasswordVisibility() {
    const input = passwordInputRef.current;
    const cursorPosition = input?.selectionStart ?? form.password.length;

    setShowPassword((prev) => !prev);

    requestAnimationFrame(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
        passwordInputRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition,
        );
      }
    });
  }

  function toggleConfirmPasswordVisibility() {
    const input = confirmPasswordInputRef.current;
    const cursorPosition = input?.selectionStart ?? form.confirmPassword.length;

    setShowConfirmPassword((prev) => !prev);

    requestAnimationFrame(() => {
      if (confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.focus();
        confirmPasswordInputRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition,
        );
      }
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim() ||
      !form.institution.trim() ||
      !form.country.trim()
    ) {
      setError("Будь ласка, заповніть усі поля.");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    try {
      setLoading(true);

      const user = await register(form);
      navigate(getRedirectByRole(user.role));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Не вдалося зареєструватися.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Реєстрація</h1>
          <p className="auth-card__subtitle">
            Створіть обліковий запис для роботи з платформою
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="auth-form__row">
            <div className="auth-form__field">
              <label htmlFor="firstName">Ім’я</label>
              <input
                id="firstName"
                name="firstName"
                autoFocus
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Введіть ім’я"
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="lastName">Прізвище</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Введіть прізвище"
              />
            </div>
          </div>

          <div className="auth-form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Введіть email"
            />
          </div>

          <div className="auth-form__row">
            <div className="auth-form__field">
              <label htmlFor="password">Пароль</label>

              <div className="auth-form__password-wrapper">
                <input
                  ref={passwordInputRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Введіть пароль"
                />

                <button
                  type="button"
                  className="auth-form__toggle-password"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? "Приховати пароль" : "Показати пароль"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-form__field">
              <label htmlFor="confirmPassword">Підтвердження пароля</label>

              <div className="auth-form__password-wrapper">
                <input
                  ref={confirmPasswordInputRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторіть пароль"
                />

                <button
                  type="button"
                  className="auth-form__toggle-password"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword ? "Приховати пароль" : "Показати пароль"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="auth-form__row">
            <div className="auth-form__field">
              <label htmlFor="institution">Наукова установа</label>
              <input
                id="institution"
                name="institution"
                type="text"
                value={form.institution}
                onChange={handleChange}
                placeholder="Введіть назву установи"
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="country">Країна</label>
              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                placeholder="Введіть країну"
              />
            </div>
          </div>

          <div className="auth-form__field">
            <label>Роль користувача</label>

            <div className="auth-form__radio-group">
              <label className="auth-form__radio">
                <input
                  type="radio"
                  name="role"
                  value="AUTHOR"
                  checked={form.role === "AUTHOR"}
                  onChange={handleChange}
                />
                <span>Автор</span>
              </label>

              <label className="auth-form__radio">
                <input
                  type="radio"
                  name="role"
                  value="REVIEWER"
                  checked={form.role === "REVIEWER"}
                  onChange={handleChange}
                />
                <span>Рецензент</span>
              </label>

              <label className="auth-form__radio">
                <input
                  type="radio"
                  name="role"
                  value="COMMITTEE"
                  checked={form.role === "COMMITTEE"}
                  onChange={handleChange}
                />
                <span>Комітет</span>
              </label>
            </div>
          </div>

          <button
            className="auth-form__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Реєстрація..." : "Зареєструватися"}
          </button>

          <p className="auth-form__footer">
            Уже маєте акаунт? <Link to="/login">Увійти</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
