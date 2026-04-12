import { useAuth } from "../features/auth/AuthContext";

export default function CommitteeDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Committee dashboard</h2>
      <p>Вітаю, {user?.email}</p>
      <p>Тут буде: керування конференціями/журналами, розподіл рецензентів, програма.</p>
    </div>
  );
}
