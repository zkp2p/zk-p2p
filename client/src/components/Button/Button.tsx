import React from "react";

import './Button.css';


interface ButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  disabled = false,
  onClick,
  children
}) => (
  <button
  className={`base ${disabled ? "disabled" : ""}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
