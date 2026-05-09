import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storage } from "../utils/storage";
import "../styles/auth.css";

export default function OrcidCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      storage.setToken(token);
      window.location.href = "/";
      return;
    }

    if (error) {
      navigate(`/login?orcidError=${encodeURIComponent(error)}`, {
        replace: true,
      });
      return;
    }

    navigate("/login", { replace: true });
  }, [params, navigate]);

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--small">
        <div className="auth-card__header">
          <h1 className="auth-card__title">ORCID</h1>
          <p className="auth-card__subtitle">
            Завершуємо авторизацію через ORCID...
          </p>
        </div>
      </div>
    </section>
  );
}