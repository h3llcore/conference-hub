import { useAuth } from "../features/auth/AuthContext";

export default function AuthorDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Author dashboard</h2>
      <p>Вітаю, {user?.email}</p>
      <p>Тут буде: подача статей, список поданих, правки після рецензій.</p>
    </div>
  );
}
