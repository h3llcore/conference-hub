import { Link } from "react-router-dom";
import "../../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__brand">
          <div className="site-footer__logo">CH</div>

          <div>
            <h2>Conference Hub</h2>
            <p>
              Вебресурс для організації наукових конференцій, журналів,
              подання статей та рецензування.
            </p>
          </div>
        </div>

        <div className="site-footer__columns">
          <div className="site-footer__column">
            <h3>Платформа</h3>

            <Link to="/about">Про платформу</Link>

            <Link to="/journals">Наукові журнали</Link>

            <Link to="/issues">Архів випусків</Link>

            <Link to="/programs">Програми конференцій</Link>
          </div>

          <div className="site-footer__column">
            <h3>Для авторів</h3>

            <Link to="/submission-rules">Правила подання</Link>

            <Link to="/author/submit">Подати статтю</Link>

            <Link to="/register">Реєстрація</Link>
          </div>

          <div className="site-footer__column">
            <h3>Підтримка</h3>

            <Link to="/contacts">Контакти</Link>

            <Link to="/feedback">Зворотний зв’язок</Link>

            <Link to="/privacy">Політика конфіденційності</Link>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        © 2026 Conference Hub. Усі права захищено.
      </div>
    </footer>
  );
}