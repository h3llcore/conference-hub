import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthUser } from "../../types/auth.types";

type HeaderProfileMenuProps = {
  user: AuthUser;
  logout: () => void;
};

function getDashboardLink(role?: string) {
  if (role === "AUTHOR") return "/author";
  if (role === "REVIEWER") return "/reviewer";
  if (role === "COMMITTEE") return "/committee";
  return "/";
}

function getRoleLabel(role?: string) {
  if (role === "AUTHOR") return "Автор";
  if (role === "REVIEWER") return "Рецензент";
  if (role === "COMMITTEE") return "Комітет";
  return "Користувач";
}

export default function HeaderProfileMenu({
  user,
  logout,
}: HeaderProfileMenuProps) {
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const profileTitle = useMemo(() => {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return fullName || user.email;
  }, [user]);

  function handleLogout() {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  }

  return (
    <div
      ref={profileRef}
      className={`layout-header__profile ${isProfileOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="layout-header__profile-trigger"
        onClick={() => setIsProfileOpen((prev) => !prev)}
        aria-expanded={isProfileOpen}
        aria-haspopup="menu"
      >
        <div className="layout-header__profile-avatar">
          {profileTitle.charAt(0).toUpperCase()}
        </div>

        <div className="layout-header__profile-info">
          <span className="layout-header__profile-name">{profileTitle}</span>
          <span className="layout-header__profile-role">
            {getRoleLabel(user.role)}
          </span>
        </div>
      </button>

      <div className="layout-header__profile-menu" role="menu">
        <Link
          to={getDashboardLink(user.role)}
          className="layout-header__profile-item"
          onClick={() => setIsProfileOpen(false)}
          role="menuitem"
        >
          <LayoutDashboard size={16} />
          <span>Мій кабінет</span>
        </Link>

        <button
          type="button"
          className="layout-header__profile-item"
          onClick={handleLogout}
          role="menuitem"
        >
          <LogOut size={16} />
          <span>Вийти</span>
        </button>
      </div>
    </div>
  );
}
