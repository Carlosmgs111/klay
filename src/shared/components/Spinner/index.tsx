import "./styles.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  id?: string;
  className?: string;
  hidden?: boolean;
  state?: "loading" | "success" | "error";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const iconSizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export default function Spinner({
  size = "md",
  id,
  className = "",
  hidden = false,
  state = "loading"
}: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        id={id}
        data-id={id}
        className={`relative ${sizeClasses[size]} ${className} ${hidden ? "hidden" : ""}`}
      >
        {state === "loading" && (
          <>
            <div className="spinner-ring spinner-ring-1 absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500" />
            <div className="spinner-ring spinner-ring-2 absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400" />
            <div className="spinner-ring spinner-ring-3 absolute inset-0 rounded-full border-2 border-transparent border-t-magenta-500" />
          </>
        )}

        {state === "success" && (
          <div
            className={`ready-icon flex items-center justify-center border-2 border-blue-500 rounded-full ${sizeClasses[size]}`}
          >
            <svg
              className={iconSizeClasses[size]}
              viewBox="0 0 24 24"
              fill="none"
              stroke="blue"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" className="text-blue-500" />
            </svg>
          </div>
        )}

        {state === "error" && (
          <div
            className={`error-icon flex items-center justify-center border-2 border-red-400 rounded-full ${sizeClasses[size]}`}
          >
            <svg
              className={iconSizeClasses[size]}
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" className="text-red-500" />
              <line x1="6" y1="6" x2="18" y2="18" className="text-red-500" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
