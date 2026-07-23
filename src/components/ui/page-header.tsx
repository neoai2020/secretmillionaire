import { ReactNode } from "react";
import { clsx } from "clsx";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  align?: "start" | "center";
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  align = "start",
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "text-center sm:text-left"
      )}
    >
      <div className={clsx("min-w-0 flex-1", align === "center" && "mx-auto sm:mx-0")}>
        <p className="page-eyebrow mb-2">{eyebrow}</p>
        <h1 className="ds-h1 text-balance">{title}</h1>
        {subtitle ? (
          <p className={clsx("ds-subtitle mt-2 max-w-2xl", align === "center" && "mx-auto sm:mx-0")}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
