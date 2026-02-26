import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
}: Props) {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-[background-color,color,box-shadow] duration-300 cursor-pointer";
  const variants = {
    primary: "bg-green-700 text-white hover:bg-green-600 shadow-lg hover:shadow-xl",
    secondary: "bg-earth-700 text-white hover:bg-earth-600 shadow-lg hover:shadow-xl",
    outline: "border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
