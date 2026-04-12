import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", style, ...props }: Props) {
  const base: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "black", color: "white", borderColor: "black" },
    ghost: { background: "white", color: "black" },
  };

  return <button {...props} style={{ ...base, ...variants[variant], ...style }} />;
}
