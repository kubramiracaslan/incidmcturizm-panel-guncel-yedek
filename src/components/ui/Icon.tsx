interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

/** Thin wrapper around a Material Symbols glyph. */
export function Icon({ name, filled = false, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none${filled ? " fill" : ""}${
        className ? ` ${className}` : ""
      }`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
