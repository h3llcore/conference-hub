import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

type HeaderDropdownItem = {
  label: string;
  to: string;
};

type HeaderDropdownProps = {
  title: string;
  items: HeaderDropdownItem[];
};

export default function HeaderDropdown({
  title,
  items,
}: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className={`layout-header__dropdown ${isOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="layout-header__menu-link"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`layout-header__dropdown-icon ${
            isOpen ? "is-rotated" : ""
          }`}
        />
      </button>

      <div className="layout-header__dropdown-menu" role="menu">
        {items.map((item) => (
          <Link key={item.label} to={item.to} onClick={closeDropdown} role="menuitem">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}