import { CalendarDays, Clock3, FileText, Plus, Search, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/author-dashboard.css";

const submissions = [
  {
    id: 1,
    title: "Моделі штучного інтелекту в освітньому середовищі",
    venue: "Журнал комп’ютерних наук",
    status: "На рецензуванні",
    date: "12.04.2026",
  },
  {
    id: 2,
    title: "Хмарні сервіси для дослідницьких платформ",
    venue: "Інформаційні системи та технології",
    status: "Прийнято",
    date: "05.04.2026",
  },
  {
    id: 3,
    title: "Цифрові екосистеми наукових комунікацій",
    venue: "Міжнародна конференція Digital Science",
    status: "Чернетка",
    date: "01.04.2026",
  },
];

const deadlines = [
  {
    id: 1,
    title: "Подання статей до конференції AI in Education",
    date: "20.04.2026",
  },
  {
    id: 2,
    title: "Фінальне завантаження матеріалів до журналу IT Research",
    date: "25.04.2026",
  },
];

const announcements = [
  {
    id: 1,
    text: "Оновлено вимоги до оформлення статей для міжнародних конференцій.",
  },
  {
    id: 2,
    text: "Доступний новий шаблон титульної сторінки для подань.",
  },
];

function getStatusClass(status: string) {
  if (status === "Прийнято") return "author-dashboard__status author-dashboard__status--accepted";
  if (status === "На рецензуванні")
    return "author-dashboard__status author-dashboard__status--review";
  if (status === "Чернетка") return "author-dashboard__status author-dashboard__status--draft";
  return "author-dashboard__status";
}

export default function AuthorDashboard() {
  return (
    <section className="author-dashboard">
      <div className="author-dashboard__hero">
        <div className="author-dashboard__hero-content">
          <p className="author-dashboard__eyebrow">Кабінет автора</p>
          <h1 className="author-dashboard__title">Вітаємо у вашому робочому просторі</h1>
          <p className="author-dashboard__description">
            Тут ви можете відстежувати свої подання, переглядати дедлайни, працювати
            з чернетками та швидко подавати нові наукові матеріали.
          </p>

          <div className="author-dashboard__hero-actions">
            <Link to="/author/submit" className="author-dashboard__hero-button author-dashboard__hero-button--primary">
              <Upload size={16} />
              <span>Подати нову роботу</span>
            </Link>

            <button type="button" className="author-dashboard__hero-button author-dashboard__hero-button--secondary">
              <Search size={16} />
              <span>Пошук журналів</span>
            </button>
          </div>
        </div>
      </div>

      <div className="author-dashboard__stats">
        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <FileText size={20} />
          </div>
          <div>
            <p className="author-dashboard__stat-value">12</p>
            <p className="author-dashboard__stat-label">Усього подань</p>
          </div>
        </article>

        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <Clock3 size={20} />
          </div>
          <div>
            <p className="author-dashboard__stat-value">3</p>
            <p className="author-dashboard__stat-label">Активних перевірок</p>
          </div>
        </article>

        <article className="author-dashboard__stat-card">
          <div className="author-dashboard__stat-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="author-dashboard__stat-value">2</p>
            <p className="author-dashboard__stat-label">Найближчі дедлайни</p>
          </div>
        </article>
      </div>

      <div className="author-dashboard__layout">
        <main className="author-dashboard__main">
          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Мої подання</h2>
              <Link to="/author/submit" className="author-dashboard__add-link">
                <Plus size={16} />
                <span>Нове подання</span>
              </Link>
            </div>

            <div className="author-dashboard__submissions">
              {submissions.map((item) => (
                <article key={item.id} className="author-dashboard__submission-card">
                  <div className="author-dashboard__submission-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.venue}</p>
                    </div>

                    <span className={getStatusClass(item.status)}>{item.status}</span>
                  </div>

                  <div className="author-dashboard__submission-bottom">
                    <span>Дата оновлення: {item.date}</span>

                    <div className="author-dashboard__submission-actions">
                      <button type="button">Переглянути</button>
                      <button type="button">Редагувати</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>

        <aside className="author-dashboard__sidebar">
          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Найближчі дедлайни</h2>
            </div>

            <div className="author-dashboard__deadlines">
              {deadlines.map((deadline) => (
                <article key={deadline.id} className="author-dashboard__deadline-card">
                  <h3>{deadline.title}</h3>
                  <span>{deadline.date}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="author-dashboard__section-card">
            <div className="author-dashboard__section-header">
              <h2>Оголошення</h2>
            </div>

            <div className="author-dashboard__announcements">
              {announcements.map((item) => (
                <article key={item.id} className="author-dashboard__announcement-card">
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}