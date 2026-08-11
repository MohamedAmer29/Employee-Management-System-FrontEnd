interface AvatarProps {
  firstName?: string;
  lastName?: string;
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-sm",
  xl: "h-32 w-32 text-4xl",
};

const getInitials = (firstName?: string, lastName?: string, name?: string) => {
  const first = (firstName || name || "?").charAt(0).toUpperCase();
  const second = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${first}${second}`.trim() || "?";
};

const Avatar = ({
  firstName,
  lastName,
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) => {
  const initials = getInitials(firstName, lastName, name);

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-semibold
        bg-primary text-white ring-2 ring-white/60 dark:ring-dark-surface
        select-none shrink-0 overflow-hidden
        ${sizeClasses[size]}
        ${className}
      `}
      aria-hidden="true"
    >
      {src ? (
        <img
          src={src}
          alt={name ?? "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
};

export default Avatar;
