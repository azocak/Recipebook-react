import { cn } from "../../lib/cn";
import { Button } from "./Button";

type PaginationControlsProps = {
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  className?: string;
};

export function PaginationControls({
  currentPage,
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
  className,
}: PaginationControlsProps) {
  return (
    <nav
      aria-label="Receptlista lapozás"
      className={cn(
        "w-96 m-auto flex flex-col gap-4 rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:flex-row sm:items-center sm:justify-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-(--color-text-secondary)">
        {currentPage}. oldal
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          fullWidth
          className="sm:w-auto"
        >
          Előző oldal
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onNextPage}
          disabled={!hasNextPage}
          fullWidth
          className="sm:w-auto"
        >
          Következő oldal
        </Button>
      </div>
    </nav>
  );
}
