import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import type { LoginPayload, UserRole } from "../types/auth.types";
import "../styles/auth.css";

function routeByRole(role: UserRole) {
  if (role === "AUTHOR") return "/author";
  if (role === "REVIEWER") return "/reviewer";
  if (role === "COMMITTEE") return "/committee";
  return "/";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Введіть email і пароль.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        email: form.email.trim(),
        password: form.password,
      });

      navigate(routeByRole(user.role), { replace: true });
    } catch (e: any) {
      setError(e.message || "Помилка входу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--small">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Вхід</h1>
          <p className="auth-card__subtitle">
            Увійдіть до свого облікового запису
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="auth-form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Введіть email"
              autoFocus
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Пароль</label>

            <div className="auth-form__password-wrapper">
              <input
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
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Приховати пароль" : "Показати пароль"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="auth-form__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>

          <p className="auth-form__footer">
            Ще не маєте акаунта? <Link to="/register">Зареєструватися</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
