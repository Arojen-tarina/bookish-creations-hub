import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ComicPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "primary";
}

export const ComicPanel = ({
  children,
  className,
  variant = "default",
}: ComicPanelProps) => {
  const variants = {
    default: "bg-card",
    accent: "bg-accent/10",
    primary: "bg-primary/5",
  };

  return (
    <div
      className={cn(
        "comic-border rounded-sm p-6",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
