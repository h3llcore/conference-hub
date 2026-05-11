import { Link } from "react-router-dom";
import { ShieldAlert, Home, LayoutDashboard } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import "../styles/unauthorized.css";

function getDashboardLink(role?: string) {
  if (role === "AUTHOR") return "/author";
  if (role === "REVIEWER") return "/reviewer";
  if (role === "COMMITTEE") return "/committee";

  return "/";
}

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <section className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-card__icon">
          <ShieldAlert size={34} />
        </div>

        <p className="unauthorized-card__eyebrow">
          Обмеження доступу
        </p>

        <h1>Немає доступу до сторінки</h1>

        <p className="unauthorized-card__description">
          У вас недостатньо прав для перегляду цієї сторінки або виконання
          даної дії.
        </p>

        <div className="unauthorized-card__actions">
          <Link
            to="/"
            className="unauthorized-card__button unauthorized-card__button--primary"
          >
            <Home size={16} />
            На головну
          </Link>

          {user && (
            <Link
              to={getDashboardLink(user.role)}
              className="unauthorized-card__button unauthorized-card__button--secondary"
            >
              <LayoutDashboard size={16} />
              Мій кабінет
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}