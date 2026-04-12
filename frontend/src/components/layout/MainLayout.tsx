import { Bell, Flag, LogIn, Upload, User } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import HeaderDropdown from "./HeaderDropdown";
import "../../styles/layout.css";

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

export default function MainLayout() {
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

            <button type="button" className="layout-header__upload">
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
