import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { getVenues } from "../features/venues/venues.api";
import "../styles/home.css";

type Venue = {
  id: string;
  title: string;
  description?: string;
  type: "JOURNAL" | "CONFERENCE";
  deadline?: string;
};

const popularArticles = [
  {
    id: "1",
    author: "Ірина Коваль",
    title: "Моделі штучного інтелекту в освітньому середовищі",
    text: "Огляд сучасних підходів до використання ШІ в навчальному процесі та його впливу на цифрову трансформацію освіти.",
  },
  {
    id: "2",
    author: "Олександр Петренко",
    title: "Хмарні обчислення для дослідницьких платформ",
    text: "Практичні аспекти побудови масштабованих вебресурсів для підтримки конференцій, журналів і спільної роботи дослідників.",
  },
];

const newsItems = [
  {
    id: "1",
    text: "Оновлено каталог наукових журналів для подання матеріалів.",
    date: "18.04.2026",
  },
  {
    id: "2",
    text: "Додано нові можливості для керування поданнями авторів.",
    date: "17.04.2026",
  },
  {
    id: "3",
    text: "Розширено перелік конференцій для участі у 2026 році.",
    date: "15.04.2026",
  },
];

export default function HomePage() {
  const [latestJournals, setLatestJournals] = useState<Venue[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLatestJournals() {
      try {
        setLoadingJournals(true);

        const data = await getVenues({
          type: "JOURNAL",
          limit: 4,
          sort: "newest",
        });

        if (isMounted) {
          setLatestJournals(data.venues || []);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setLatestJournals([]);
        }
      } finally {
        if (isMounted) {
          setLoadingJournals(false);
        }
      }
    }

    loadLatestJournals();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Наукова платформа</p>

          <h1 className="home-hero__title">
            Conference Hub – вебресурс для конференцій та наукових журналів
          </h1>

          <p className="home-hero__description">
            Зручний простір для пошуку журналів, перегляду актуальних статей, відстеження новин та
            організації подання наукових матеріалів.
          </p>

          <div className="home-hero__actions">
            <Link to="/journals" className="home-hero__button home-hero__button--primary">
              Почати пошук
            </Link>

            <Link to="/register" className="home-hero__button home-hero__button--secondary">
              Створити акаунт
            </Link>
          </div>
        </div>
      </div>

      <div className="home-search">
        <div className="home-search__grid">
          <div className="home-search__field">
            <label htmlFor="author-search">Пошук за автором або напрямком</label>
            <input
              id="author-search"
              type="text"
              placeholder="Введіть автора або науковий напрям"
            />
          </div>

          <div className="home-search__field">
            <label htmlFor="article-search">Пошук за назвою або ключовими словами</label>
            <input
              id="article-search"
              type="text"
              placeholder="Введіть назву статті або ключові слова"
            />
          </div>

          <div className="home-search__actions">
            <button type="button" className="home-search__filter">
              <SlidersHorizontal size={16} />
              <span>Фільтри</span>
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
              {loadingJournals && <div>Завантаження журналів...</div>}

              {!loadingJournals && latestJournals.length === 0 && (
                <div>Поки що журналів немає.</div>
              )}

              {!loadingJournals &&
                latestJournals.length > 0 &&
                latestJournals.map((journal, index) => (
                  <article key={journal.id} className="home-journal-card">
                    <div>
                      <h3>{journal.title}</h3>
                      <p>Наукове видання</p>
                    </div>

                    <span>{(4.9 - index * 0.1).toFixed(1)}</span>
                  </article>
                ))}
            </div>
          </div>
        </aside>

        <main className="home-main">
          <div className="home-section-card">
            <div className="home-section-card__header">
              <h2>Популярні статті</h2>
              <Link to="/journals">Дивитися всі</Link>
            </div>

            <div className="home-articles">
              {popularArticles.map((article) => (
                <article key={article.id} className="home-article-card">
                  <div className="home-article-card__meta">
                    <p className="home-article-card__author">{article.author}</p>
                  </div>

                  <h3>{article.title}</h3>
                  <p className="home-article-card__excerpt">{article.text}</p>

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
              <h2>Останні новини / оголошення</h2>
            </div>

            <div className="home-news-list">
              {newsItems.map((item) => (
                <article key={item.id} className="home-news-card">
                  <p>{item.text}</p>
                  <span>{item.date}</span>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="home-footer">© 2026 Conference Hub. Усі права захищено.</footer>
    </section>
  );
}
