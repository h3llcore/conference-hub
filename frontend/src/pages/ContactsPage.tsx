import "../styles/footer.css";

export default function ContactsPage() {
  return (
    <section className="info-page">
      <div className="info-page__card">
        <p className="info-page__eyebrow">Підтримка</p>
        <h1>Контакти</h1>

        <div className="info-page__grid">
          <div className="info-page__item">
            <h2>Адміністрація платформи</h2>
            <p>Email: conferencehub@example.com</p>
            <p>Графік роботи: Пн–Пт, 09:00–17:00</p>
          </div>

          <div className="info-page__item">
            <h2>Технічна підтримка</h2>
            <p>Email: support@example.com</p>
            <p>Допомога з реєстрацією, поданням статей та доступом до кабінету.</p>
          </div>

          <div className="info-page__item">
            <h2>Оргкомітет</h2>
            <p>Email: committee@example.com</p>
            <p>Питання щодо конференцій, журналів, рецензування та публікацій.</p>
          </div>
        </div>
      </div>
    </section>
  );
}