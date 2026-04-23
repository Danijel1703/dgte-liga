const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-orange-600",
  "bg-teal-600",
];

export function avatarColorClass(firstName: string, lastName: string): string {
  return AVATAR_COLORS[
    (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % AVATAR_COLORS.length
  ];
}

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function PlayerAvatar({
  firstName,
  lastName,
  size = "sm",
  className = "",
}: PlayerAvatarProps) {
  const color = avatarColorClass(firstName, lastName);
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`${sizeClass} rounded-full ${color} flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}
