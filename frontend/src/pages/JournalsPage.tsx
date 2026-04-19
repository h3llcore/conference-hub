import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getVenues } from "../features/venues/venues.api";
import { useNavigate } from "react-router-dom";
import "../styles/journals.css";

type Venue = {
  id: string;
  title: string;
  description?: string;
  type: "JOURNAL" | "CONFERENCE";
  deadline?: string;
};

export default function JournalsPage() {
  const [journals, setJournals] = useState<Venue[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadVenues() {
      try {
        setLoading(true);
        setError("");

        const data = await getVenues({
          type: "JOURNAL",
          sort: "newest",
        });

        if (isMounted) {
          setJournals(data.venues || []);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Не вдалося завантажити журнали.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJournals = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return journals;

    return journals.filter((journal) => {
      const title = journal.title?.toLowerCase() || "";
      const description = journal.description?.toLowerCase() || "";

      return title.includes(query) || description.includes(query);
    });
  }, [journals, search]);

  return (
    <section className="journals-page">
      <div className="journals-page__hero">
        <p className="journals-page__eyebrow">Каталог журналів</p>
        <h1 className="journals-page__title">Пошук наукових журналів</h1>
        <p className="journals-page__description">
          Знайдіть журнал за назвою або коротким описом і перегляньте доступні
          видання для подання матеріалів.
        </p>

        <button
          type="button"
          className="journals-page__back"
          onClick={() => navigate(-1)}
        >
          <span className="journals-page__back-arrow">←</span>
          <span>Назад</span>
        </button>
      </div>

      <div className="journals-page__search">
        <div className="journals-page__search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Введіть назву журналу"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="journals-page__content">
        {loading && (
          <div className="journals-page__state">Завантаження журналів...</div>
        )}

        {!loading && error && (
          <div className="journals-page__state journals-page__state--error">
            {error}
          </div>
        )}

        {!loading && !error && filteredJournals.length === 0 && (
          <div className="journals-page__state">
            Нічого не знайдено за вашим запитом.
          </div>
        )}

        {!loading && !error && filteredJournals.length > 0 && (
          <div className="journals-page__grid">
            {filteredJournals.map((journal) => (
              <article key={journal.id} className="journals-page__card">
                <h2>{journal.title}</h2>

                <p className="journals-page__type">Науковий журнал</p>

                <p className="journals-page__description-text">
                  {journal.description || "Опис журналу поки що не додано."}
                </p>

                {journal.deadline && (
                  <p className="journals-page__deadline">
                    Дедлайн:{" "}
                    {new Date(journal.deadline).toLocaleDateString("uk-UA")}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}