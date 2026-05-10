import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import "../styles/footer.css";

export default function PrivacyPage() {
  return (
    <section className="info-page">
      <div className="info-page__card">
        <p className="info-page__eyebrow">Безпека даних</p>

        <h1>Політика конфіденційності</h1>

        <p>
          Платформа Conference Hub використовує персональні дані користувачів
          лише для забезпечення роботи системи: реєстрації, авторизації,
          подання матеріалів, рецензування та комунікації між учасниками
          наукового процесу.
        </p>

        <div className="info-page__grid">
          <div className="info-page__item">
            <UserCheck size={22} />

            <h2>Які дані зберігаються</h2>

            <p>
              До даних користувача можуть належати ім’я, прізвище, електронна
              адреса, наукова установа, країна, науковий ступінь, ORCID,
              Google Scholar та інформація профілю.
            </p>
          </div>

          <div className="info-page__item">
            <ShieldCheck size={22} />

            <h2>Для чого використовуються дані</h2>

            <p>
              Дані використовуються для ідентифікації користувача, розподілу
              ролей, подання статей, рецензування, формування програм
              конференцій та публікації матеріалів.
            </p>
          </div>

          <div className="info-page__item">
            <LockKeyhole size={22} />

            <h2>Захист інформації</h2>

            <p>
              Доступ до окремих функцій системи обмежується ролями користувачів.
              Комітет, автори та рецензенти мають різні рівні доступу.
            </p>
          </div>

          <div className="info-page__item">
            <KeyRound size={22} />

            <h2>Безпека акаунтів</h2>

            <p>
              Для авторизації та доступу до функціоналу платформи
              використовується система ролей та захищених маршрутів.
              Користувачі мають доступ лише до тих функцій, які відповідають
              їхній ролі у системі.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}