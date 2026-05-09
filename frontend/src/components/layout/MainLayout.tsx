import { Flag, LogIn, Upload, User } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import HeaderDropdown from "./HeaderDropdown";
import HeaderProfileMenu from "./HeaderProfileMenu";
import { useAuth } from "../../features/auth/AuthContext";
import { useLanguage } from "../../features/language/LanguageContext";
import NotificationDropdown from "../notifications/NotificationDropdown";

import "../../styles/layout.css";
import "../../styles/header-dropdown.css";
import "../../styles/header-profile.css";

const conferenceItems = [
  { label: "Міжнародні конференції", to: "/" },
  { label: "Всеукраїнські конференції", to: "/" },
  { label: "Програми конференцій", to: "/programs" },
  { label: "Архів конференцій", to: "/programs/archive" },
];

const journalItems = [
  { label: "Каталог журналів", to: "/journals" },
  { label: "Рейтингові журнали", to: "/" },
  { label: "Нові випуски", to: "/" },
];

const submissionItems = [
  { label: "Подати статтю", to: "/author/submit" },
  { label: "Вимоги до оформлення", to: "/" },
  { label: "Статус подання", to: "/author" },
];

const contactItems = [
  { label: "Адміністрація", to: "/" },
  { label: "Технічна підтримка", to: "/" },
  { label: "Зворотний зв’язок", to: "/" },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

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
            <HeaderDropdown title="Подання матеріалів" items={submissionItems} />

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
            {user && <NotificationDropdown />}

            <button
              type="button"
              className="layout-header__lang"
              aria-label="Зміна мови"
              onClick={toggleLanguage}
            >
              <Flag size={16} />
              <span>{language === "ua" ? "UA" : "EN"}</span>
            </button>

            {user ? (
              <HeaderProfileMenu user={user} logout={logout} />
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

            {user?.role === "AUTHOR" && (
              <Link to="/author/submit" className="layout-header__upload">
                <Upload size={16} />
                <span>Завантажити роботу</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}