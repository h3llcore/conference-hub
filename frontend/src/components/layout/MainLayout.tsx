import {
  Bell,
  Flag,
  LogIn,
  Upload,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import HeaderDropdown from "./HeaderDropdown";
import { useAuth } from "../../features/auth/AuthContext";
import "../../styles/layout.css";
import "../../styles/header-dropdown.css";
import "../../styles/header-profile.css";

const conferenceItems = [
  { label: "Міжнародні конференції", to: "/" },
  { label: "Всеукраїнські конференції", to: "/" },
  { label: "Архів конференцій", to: "/" },
];

const journalItems = [
  { label: "Каталог журналів", to: "/" },
  { label: "Рейтингові журнали", to: "/" },
  { label: "Нові випуски", to: "/" },
];

const submissionItems = [
  { label: "Подати статтю", to: "/" },
  { label: "Вимоги до оформлення", to: "/" },
  { label: "Статус подання", to: "/" },
];

const contactItems = [
  { label: "Адміністрація", to: "/" },
  { label: "Технічна підтримка", to: "/" },
  { label: "Зворотний зв’язок", to: "/" },
];

function getDashboardLink(role?: string) {
  if (role === "AUTHOR") return "/author";
  if (role === "REVIEWER") return "/reviewer";
  if (role === "COMMITTEE") return "/committee";
  return "/";
}

function getRoleLabel(role?: string) {
  if (role === "AUTHOR") return "Автор";
  if (role === "REVIEWER") return "Рецензент";
  if (role === "COMMITTEE") return "Комітет";
  return "Користувач";
}

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const profileTitle = useMemo(() => {
    if (!user) return "";
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return fullName || user.email;
  }, [user]);

  function handleLogout() {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  }

  function handleUploadClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "AUTHOR") {
      navigate("/author");
      return;
    }

    if (user.role === "REVIEWER") {
      navigate("/reviewer");
      return;
    }

    if (user.role === "COMMITTEE") {
      navigate("/committee");
      return;
    }

    navigate("/");
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header__container">
          <div className="layout-header__left">
            <Link to="/" className="layout-header__brand">
              <div className="layout-header__logo-circle">CH</div>
              <div className="layout-header__brand-text">
                <span className="layout-header__brand-title">
                  Conference Hub
                </span>
                <span className="layout-header__brand-subtitle">
                  Наукова платформа
                </span>
              </div>
            </Link>
          </div>

          <nav className="layout-header__menu">
            <HeaderDropdown title="Конференції" items={conferenceItems} />
            <HeaderDropdown title="Наукові журнали" items={journalItems} />
            <HeaderDropdown
              title="Подання матеріалів"
              items={submissionItems}
            />

            <Link
              to="/"
              className="layout-header__menu-link layout-header__menu-link--static"
            >
              Новини
            </Link>

            <Link
              to="/"
              className="layout-header__menu-link layout-header__menu-link--static"
            >
              Інформація про платформу
            </Link>

            <HeaderDropdown title="Контакти" items={contactItems} />
          </nav>

          <div className="layout-header__right">
            <button
              type="button"
              className="layout-header__icon-button"
              aria-label="Сповіщення"
            >
              <Bell size={18} />
            </button>

            <button
              type="button"
              className="layout-header__lang"
              aria-label="Зміна мови"
            >
              <Flag size={16} />
              <span>UA / ENG</span>
            </button>

            {user ? (
              <div
                ref={profileRef}
                className={`layout-header__profile ${isProfileOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="layout-header__profile-trigger"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-expanded={isProfileOpen}
                >
                  <div className="layout-header__profile-avatar">
                    {profileTitle.charAt(0).toUpperCase()}
                  </div>

                  <div className="layout-header__profile-info">
                    <span className="layout-header__profile-name">
                      {profileTitle}
                    </span>
                    <span className="layout-header__profile-role">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </button>

                <div className="layout-header__profile-menu">
                  <Link
                    to={getDashboardLink(user.role)}
                    className="layout-header__profile-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Мій кабінет</span>
                  </Link>

                  <button
                    type="button"
                    className="layout-header__profile-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Вийти</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="layout-header__auth-links">
                <Link to="/login" className="layout-header__auth-link">
                  <LogIn size={16} />
                  <span>Увійти</span>
                </Link>

                <Link to="/register" className="layout-header__auth-link">
                  <User size={16} />
                  <span>Реєстрація</span>
                </Link>
              </div>
            )}

            <button
              type="button"
              className="layout-header__upload"
              onClick={handleUploadClick}
            >
              <Upload size={16} />
              <span>Завантажити роботу</span>
            </button>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
