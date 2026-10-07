import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}
