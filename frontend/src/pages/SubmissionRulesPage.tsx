import { CheckCircle2, FileText, RefreshCcw, Upload } from "lucide-react";
import "../styles/footer.css";

export default function SubmissionRulesPage() {
  return (
    <section className="info-page">
      <div className="info-page__card">
        <p className="info-page__eyebrow">Для авторів</p>

        <h1>Правила подання матеріалів</h1>

        <p>
          Перед поданням статті автор повинен ознайомитися з основними вимогами
          до оформлення, структури матеріалу та процесу рецензування.
        </p>

        <div className="info-page__grid">
          <div className="info-page__item">
            <FileText size={22} />
            <h2>1. Структура статті</h2>
            <p>
              Стаття повинна містити назву, анотацію, ключові слова, основний
              текст, висновки та список використаних джерел.
            </p>
          </div>

          <div className="info-page__item">
            <Upload size={22} />
            <h2>2. Формат файлу</h2>
            <p>
              Рекомендований формат подання – PDF або DOCX. Файл має бути
              читабельним, структурованим та відповідати вимогам обраного
              журналу або конференції.
            </p>
          </div>

          <div className="info-page__item">
            <RefreshCcw size={22} />
            <h2>3. Доопрацювання</h2>
            <p>
              Якщо рецензент або комітет виявить недоліки, стаття може бути
              повернена автору на доопрацювання з відповідними зауваженнями.
            </p>
          </div>

          <div className="info-page__item">
            <CheckCircle2 size={22} />
            <h2>4. Публікація</h2>
            <p>
              Після успішного проходження рецензування стаття може бути
              прийнята, опублікована та додана до випуску журналу або збірника
              конференції.
            </p>
          </div>
        </div>

        <div className="info-page__item">
          <h2>Основні статуси статті</h2>
          <p>
            У системі передбачено такі статуси: чернетка, подано, на
            рецензуванні, потребує доопрацювання, повторно подано, прийнято,
            відхилено та опубліковано.
          </p>
        </div>
      </div>
    </section>
  );
}