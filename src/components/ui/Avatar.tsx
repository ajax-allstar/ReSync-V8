import { useState } from "react";

type AvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  email?: string | null;
  fullName?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

function getInitials(fullName?: string | null, email?: string | null) {
  const source = fullName?.trim() || email?.split("@")[0] || "ReSync";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function Avatar({
  avatarUrl,
  className = "",
  email,
  fullName,
  size = "md",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(avatarUrl) && !imageError;

  return (
    <div
      aria-hidden="true"
      className={[
        "grid place-items-center overflow-hidden rounded-2xl border border-white/75 bg-[linear-gradient(145deg,rgba(202,183,255,0.88),rgba(255,226,203,0.9))] font-semibold text-slate-700 shadow-[0_10px_22px_rgba(128,108,149,0.14)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(127,107,176,0.76),rgba(131,89,78,0.8))] dark:text-white",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {showImage ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          src={avatarUrl ?? ""}
        />
      ) : (
        <span>{getInitials(fullName, email)}</span>
      )}
    </div>
  );
}
