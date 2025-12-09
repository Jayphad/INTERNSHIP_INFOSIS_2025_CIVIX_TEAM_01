import React from "react";

const SvgStar = ({ filled = false, size = 16, className = "", title = "" }) => {
  const fillColor = filled ? "#FFD700" : "transparent";
  const strokeColor = filled ? "#D7A600" : "#ccc";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? "false" : "true"}
      role="img"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2.5l2.9 6 6.6.6-5 4.2 1.6 6.3L12 17.7 6.9 20.8 8.5 14.5 3.5 10.3l6.6-.6L12 2.5z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SvgStar;
