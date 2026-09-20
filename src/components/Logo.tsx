import React, { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  withBackground?: boolean;
  ariaLabel?: string;
}

export function Logo({
  size = 28,
  className = "",
  withBackground = true,
  ariaLabel = "First Issues Logo",
}: LogoProps) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="9"
          y1="24"
          x2="23"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e6ad2" />
          <stop offset="1" stopColor="#828fff" />
        </linearGradient>
      </defs>

      {withBackground && (
        <rect
          width="32"
          height="32"
          rx="7"
          className="fill-surface-2 stroke-hairline"
          strokeWidth="1"
        />
      )}

      {/* Main Git Trunk */}
      <line
        x1="10"
        y1="8"
        x2="10"
        y2="24"
        stroke="#5e6ad2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Top Arm (Upper Git Branch) */}
      <line
        x1="10"
        y1="8"
        x2="22.5"
        y2="8"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Mid Arm (Git Feature Branch curving out from trunk) */}
      <path
        d="M10 19.5 C10 15, 12.5 14.5, 15.5 14.5 H19.5"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Top Branch End Commit Node */}
      <circle cx="22.5" cy="8" r="2.2" fill="#5e6ad2" />

      {/* Trunk Top Node */}
      <circle cx="10" cy="8" r="2.2" fill="#5e6ad2" />

      {/* Trunk Bottom Commit Node */}
      <circle
        cx="10"
        cy="24"
        r="2.2"
        className="fill-canvas"
        stroke="#5e6ad2"
        strokeWidth="1.8"
      />

      {/* First Issue Target Node (Open issue ring with center accent dot) */}
      <circle
        cx="19.5"
        cy="14.5"
        r="2.5"
        className="fill-canvas"
        stroke="#828fff"
        strokeWidth="1.8"
      />
      <circle cx="19.5" cy="14.5" r="0.9" fill="#828fff" />
    </svg>
  );
}

export default Logo;
