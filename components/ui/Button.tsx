import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

// The one CTA shape (QA DS-07). Before this, primary actions came in five
// radii and five heights. Square corners to match the editorial cards, a
// 44px minimum tap height, sentence case, Inter Tight 14/500.
//
// primary   accent-strong fill, white text (5.79:1; the bright accent is 4.07:1)
// secondary 1px ink outline
// ghost     text only, for low-emphasis actions next to a primary

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none border font-sans font-medium text-center " +
  "transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-accent-strong text-white hover:bg-ink hover:text-paper",
  secondary: "border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "border-transparent text-ink underline-offset-4 hover:underline",
};

const SIZE: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-[52px] px-7 py-3 text-base",
};

export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps = {}): string {
  return [BASE, VARIANT[variant], SIZE[size], className].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...rest} />;
}
