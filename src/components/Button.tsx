import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variantClasses = {
  primary: "bg-rose-300 hover:bg-rose-400 text-white shadow-md shadow-rose-200/50",
  secondary: "bg-rose-50 hover:bg-rose-100 text-rose-600",
  success: "bg-leaf-400 hover:bg-leaf-500 text-white shadow-md shadow-leaf-200/50",
  danger: "bg-red-400 hover:bg-red-500 text-white",
  ghost: "bg-transparent hover:bg-rose-50 text-ink/70 hover:text-rose-600",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5 active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
