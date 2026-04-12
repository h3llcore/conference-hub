import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
      {...props}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        width: "100%",
      }}
    />
  );
}
