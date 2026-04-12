import "../styles/home.css";

const journals = [
  { id: 1, title: "Журнал комп’ютерних наук", rating: "4.9" },
  { id: 2, title: "Інформаційні системи та технології", rating: "4.8" },
  { id: 3, title: "Сучасні дослідження в ІТ", rating: "4.7" },
  { id: 4, title: "Науковий вісник цифрових рішень", rating: "4.6" },
];

const articles = [
  {
    id: 1,
    title: "Моделі штучного інтелекту в освітньому середовищі",
    author: "Ірина Коваль",
    excerpt:
      "Огляд сучасних підходів до використання ШІ в навчальному процесі та його впливу на цифрову трансформацію освіти.",
  },
  {
    id: 2,
    title: "Хмарні обчислення для дослідницьких платформ",
    author: "Олександр Петренко",
    excerpt:
      "Практичні аспекти побудови масштабованих вебресурсів для підтримки конференцій, журналів і спільної роботи дослідників.",
  },
];

const news = [
  {
    id: 1,
    text: "Відкрито прийом матеріалів до міжнародної конференції з цифрових технологій.",
    date: "12.04.2026",
  },
  {
    id: 2,
    text: "Оновлено правила подання статей до наукових журналів платформи.",
    date: "09.04.2026",
  },
  {
    id: 3,
    text: "Запущено новий модуль фільтрації та пошуку наукових матеріалів.",
    date: "05.04.2026",
  },
];

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Наукова платформа</p>
          <h1 className="home-hero__title">
            Conference Hub – вебресурс для конференцій та наукових журналів
          </h1>
          <p className="home-hero__description">
            Зручний простір для пошуку журналів, перегляду актуальних статей,
            відстеження новин та організації подання наукових матеріалів.
          </p>

          <div className="home-hero__actions">
            <a
              href="#search"
              className="home-hero__button home-hero__button--primary"
            >
              Почати пошук
            </a>
            <a
              href="/register"
              className="home-hero__button home-hero__button--secondary"
            >
              Створити акаунт
            </a>
          </div>
        </div>
      </div>

      <div className="home-search" id="search">
        <div className="home-search__grid">
          <div className="home-search__field">
            <label htmlFor="authorSearch">Пошук за автором або напрямком</label>
            <input
              id="authorSearch"
              type="text"
              placeholder="Введіть автора або науковий напрям"
            />
          </div>

          <div className="home-search__field">
            <label htmlFor="keywordSearch">
              Пошук за назвою або ключовими словами
            </label>
            <input
              id="keywordSearch"
              type="text"
              placeholder="Введіть назву статті або ключові слова"
            />
          </div>

          <div className="home-search__actions">
            <button type="button" className="home-search__filter">
              Фільтри
            </button>
            <button type="button" className="home-search__button">
              Пошук
            </button>
          </div>
        </div>
      </div>

      <div className="home-layout">
        <aside className="home-sidebar">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Доступні журнали</h2>
              <button type="button">Фільтри</button>
            </div>

            <div className="home-journals">
              {journals.map((journal) => (
                <article key={journal.id} className="home-journal-card">
                  <div>
                    <h3>{journal.title}</h3>
                    <p>Наукове видання</p>
                  </div>
                  <span>{journal.rating}</span>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <main className="home-main">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Популярні статті</h2>
              <a href="/">Дивитися всі</a>
            </div>

            <div className="home-articles">
              {articles.map((article) => (
                <article key={article.id} className="home-article-card">
                  <div className="home-article-card__meta">
                    <p className="home-article-card__author">
                      {article.author}
                    </p>
                  </div>
                  <h3>{article.title}</h3>
                  <p className="home-article-card__excerpt">
                    {article.excerpt}
                  </p>
                  <button type="button" className="home-article-card__button">
                    Читати детальніше
                  </button>
                </article>
              ))}
            </div>
          </div>
        </main>

        <aside className="home-news">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Новини / оголошення</h2>
            </div>

            <div className="home-news-list">
              {news.map((item) => (
                <article key={item.id} className="home-news-card">
                  <p>{item.text}</p>
                  <span>{item.date}</span>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="home-footer">
        <p>© 2026 Conference Hub. Усі права захищено.</p>
      </footer>
    </section>
  );
}
