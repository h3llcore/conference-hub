import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
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
          Якщо у вас виникли питання щодо роботи платформи, подання статей,
          рецензування або доступу до особистого кабінету, заповніть форму
          нижче.
        </p>

        {sent && (
          <div className="info-page__success">
            Повідомлення умовно надіслано. У межах дипломного проєкту ця форма
            демонструє інтерфейс зворотного зв’язку.
          </div>
        )}

        <form className="info-form" onSubmit={handleSubmit}>
          <label>
            Ваше ім’я
            <input type="text" placeholder="Введіть ваше ім’я" required />
          </label>

          <label>
            Email
            <input type="email" placeholder="Введіть email" required />
          </label>

          <label>
            Тема звернення
            <input
              type="text"
              placeholder="Наприклад: питання щодо подання статті"
              required
            />
          </label>

          <label>
            Категорія
            <select required>
              <option value="">Оберіть категорію</option>
              <option value="account">Проблема з акаунтом</option>
              <option value="submission">Подання статті</option>
              <option value="review">Рецензування</option>
              <option value="conference">Конференції</option>
              <option value="other">Інше</option>
            </select>
          </label>

          <label>
            Повідомлення
            <textarea
              rows={6}
              placeholder="Опишіть ваше питання або проблему"
              required
            />
          </label>

          <button type="submit">
            <Send size={16} />
            Надіслати
          </button>
        </form>

        <div className="info-page__item">
          <MessageSquareText size={22} />
          <h2>Примітка</h2>
          <p>
            У майбутньому цю форму можна підключити до backend-модуля звернень
            або надсилання повідомлень на email адміністрації.
          </p>
        </div>
      </div>
    </section>
  );
}