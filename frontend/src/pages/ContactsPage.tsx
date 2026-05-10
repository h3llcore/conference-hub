import { Headphones, Mail, MapPin, Users } from "lucide-react";
import "../styles/footer.css";

export default function ContactsPage() {
  return (
    <section className="info-page">
      <div className="info-page__card">
        <p className="info-page__eyebrow">Підтримка</p>

        <h1>Контакти</h1>

        <p>
          На цій сторінці розміщено контактну інформацію для зв’язку з
          адміністрацією платформи, технічною підтримкою та оргкомітетом.
        </p>

        <div className="info-page__grid">
          <div className="info-page__item">
            <Users size={22} />
            <h2>Адміністрація платформи</h2>
            <p>Email: conferencehub@example.com</p>
            <p>Графік роботи: Пн–Пт, 09:00–17:00</p>
          </div>

          <div className="info-page__item">
            <Headphones size={22} />
            <h2>Технічна підтримка</h2>
            <p>Email: support@example.com</p>
            <p>
              Допомога з реєстрацією, авторизацією, поданням статей та доступом
              до особистого кабінету.
            </p>
          </div>

          <div className="info-page__item">
            <Mail size={22} />
            <h2>Оргкомітет</h2>
            <p>Email: committee@example.com</p>
            <p>
              Питання щодо конференцій, журналів, рецензування, програм та
              публікації матеріалів.
            </p>
          </div>

          <div className="info-page__item">
            <MapPin size={22} />
            <h2>Адреса</h2>
            <p>Україна</p>
            <p>Онлайн-платформа для підтримки наукової діяльності.</p>
          </div>
        </div>
      </div>
    </section>
  );
}