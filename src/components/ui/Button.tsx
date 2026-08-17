import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger-ghost";

const variantClasses: Record<ButtonVariant, string> = {
  // Filled brand button — primary actions ("Yeni Talep Oluştur", "Talep Oluştur").
  primary:
    "bg-brand text-primary-container hover:bg-brand-dark font-semibold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5",
  // Outlined mint button — secondary actions ("İptal", "Dışa Aktar").
  secondary:
    "border border-secondary/50 text-secondary hover:bg-secondary/10",
  // Text-only, low-priority actions.
  ghost: "text-on-surface-variant hover:text-secondary hover:bg-surface-container",
  // Text-only, destructive actions ("Çıkış Yap").
  "danger-ghost": "text-on-surface-variant hover:text-error hover:bg-error/10",
};

const sharedClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg text-body-md font-body-md px-5 py-2.5 transition-colors disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: ButtonVariant;
  icon?: string;
  iconTrailing?: string;
  className?: string;
  children: React.ReactNode;
}

type LinkVariantProps = CommonProps & {
  href: string;
};

type ButtonVariantProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

function ButtonContent({
  icon,
  iconTrailing,
  children,
}: Pick<CommonProps, "icon" | "iconTrailing" | "children">) {
  return (
    <>
      {icon && <Icon name={icon} className="text-lg" />}
      {children}
      {iconTrailing && <Icon name={iconTrailing} className="text-lg" />}
    </>
  );
}

export function Button({
  variant = "primary",
  icon,
  iconTrailing,
  className = "",
  children,
  ...rest
}: LinkVariantProps | ButtonVariantProps) {
  const classes = `${sharedClasses} ${variantClasses[variant]} ${className}`.trim();

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes}>
        <ButtonContent icon={icon} iconTrailing={iconTrailing}>
          {children}
        </ButtonContent>
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)}
    >
      <ButtonContent icon={icon} iconTrailing={iconTrailing}>
        {children}
      </ButtonContent>
    </button>
  );
}
