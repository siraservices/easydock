"use client";

interface StarRatingProps {
  value: number;       // 1-5, supports decimals for display
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: false;
}

interface InteractiveStarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive: true;
  onChange: (value: number) => void;
}

type Props = StarRatingProps | InteractiveStarRatingProps;

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function StarRating(props: Props) {
  const { value, max = 5, size = "md" } = props;
  const interactive = props.interactive === true;
  const onChange = interactive ? (props as InteractiveStarRatingProps).onChange : undefined;

  return (
    <div className="flex gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        const half = !filled && value >= starValue - 0.5;

        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? value === starValue : undefined}
            disabled={!interactive}
            onClick={interactive ? () => onChange?.(starValue) : undefined}
            className={[
              SIZE_MAP[size],
              "transition-transform",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
              !interactive && "pointer-events-none",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#d1d5db" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 1l2.47 5.01L18 6.91l-4 3.9.94 5.49L10 13.77 5.06 16.3 6 10.81 2 6.91l5.53-.9L10 1z"
                    fill={`url(#half-${i})`}
                    stroke="#f59e0b"
                    strokeWidth="0.5"
                  />
                </>
              ) : (
                <path
                  d="M10 1l2.47 5.01L18 6.91l-4 3.9.94 5.49L10 13.77 5.06 16.3 6 10.81 2 6.91l5.53-.9L10 1z"
                  fill={filled ? "#f59e0b" : "#d1d5db"}
                  stroke={filled ? "#f59e0b" : "#d1d5db"}
                  strokeWidth="0.5"
                />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
