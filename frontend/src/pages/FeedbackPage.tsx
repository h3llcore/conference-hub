import { useState } from "react";
import "../styles/footer.css";

export default function FeedbackPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="info-page">
      <div className="info-page__card">
        <p className="info-page__eyebrow">Зворотний зв’язок</p>
        <h1>Написати повідомлення</h1>

        <p>
          Заповніть форму, щоб надіслати звернення адміністрації платформи або
          технічній підтримці.
        </p>

        {sent && (
          <div className="info-page__success">
            Повідомлення умовно надіслано. Для дипломного проєкту форма
            демонструє інтерфейс зворотного зв’язку.
          </div>
        )}

        <form className="info-form" onSubmit={handleSubmit}>
          <label>
            Ваше ім’я
            <input type="text" placeholder="Введіть ім’я" />
          </label>

          <label>
            Email
            <input type="email" placeholder="Введіть email" />
          </label>

          <label>
            Тема звернення
            <input type="text" placeholder="Наприклад: питання щодо подання" />
          </label>

          <label>
            Повідомлення
            <textarea rows={5} placeholder="Опишіть ваше питання" />
          </label>

          <button type="submit">Надіслати</button>
        </form>
      </div>
    </section>
  );
}