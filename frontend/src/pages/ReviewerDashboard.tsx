import { useAuth } from "../features/auth/AuthContext";

export default function ReviewerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Reviewer dashboard</h2>
      <p>Вітаю, {user?.email}</p>
      <p>Тут буде: список статей на рецензування, форма оцінки, коментарі.</p>
    </div>
  );
}
