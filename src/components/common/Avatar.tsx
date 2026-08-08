interface AvatarProps {
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-sm",
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
  size = "md",
  className = "",
}: AvatarProps) => {
  const initials = getInitials(firstName, lastName, name);

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-semibold
        bg-primary text-white ring-2 ring-white/60 dark:ring-dark-surface
        select-none shrink-0
        ${sizeClasses[size]}
        ${className}
      `}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

export default Avatar;
