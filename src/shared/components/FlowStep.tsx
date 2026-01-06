import { sc } from "@/shared/utils/sc";
import type React from "react";

interface FlowStepProps {
  title: string;
  help?: string;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export default function FlowStep({
  title,
  help,
  className = "",
  id,
  children,
}: FlowStepProps) {
  return (
    <div
      id={id}
      className={sc(
        "relative pt-4 pb-4 border border-slate-600/50 p-6 rounded-md",
        className
      )}
    >
      <div className="flex flex-col gap-2 font-thin">
        <div className="flex items-center justify-between border-b border-slate-600/20 pb-2">
          <span>{title}</span>
          <div className={sc("event-none group relative", !help && "hidden")}>
            <i className="bx bx-info-circle"></i>
            <span
              className={sc(
                "pointer-events-none tooltip absolute group-hover:opacity-100 transition-opacity duration-150",
                "opacity-0 w-48 bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 text-xs right-6"
              )}
            >
              {help}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
