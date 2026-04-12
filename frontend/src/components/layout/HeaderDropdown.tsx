import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="layout-header__dropdown">
      <button type="button" className="layout-header__menu-link">
        <span>{title}</span>
        <ChevronDown size={16} />
      </button>

      <div className="layout-header__dropdown-menu">
        {items.map((item) => (
          <Link key={item.label} to={item.to}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}