import { useId, type ChangeEvent } from "react";

import type { RecipeOrdering } from "../../api/types";
import { RECIPE_ORDERING_OPTIONS } from "../../constants/recipe";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type RecipeFilterBarProps = {
  search: string;
  ordering: RecipeOrdering | "";
  onSearchChange: (search: string) => void;
  onOrderingChange: (ordering: RecipeOrdering | "") => void;
  onReset: () => void;
  isResetDisabled?: boolean;
  className?: string;
};

export function RecipeFilterBar({
  search,
  ordering,
  onSearchChange,
  onOrderingChange,
  onReset,
  isResetDisabled = false,
  className,
}: RecipeFilterBarProps) {
  const orderingSelectId = useId();

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  function handleOrderingChange(event: ChangeEvent<HTMLSelectElement>) {
    onOrderingChange(event.target.value as RecipeOrdering | "");
  }

  return (
    <section
      aria-label="Receptlista szűrők"
      className={cn(
        "rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm",
        className,
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)_auto] lg:items-start">
        <Input
          type="search"
          label="Keresés"
          value={search}
          onChange={handleSearchChange}
          placeholder="pl. palacsinta"
          hint="Keress receptcím alapján."
          containerClassName="min-w-0"
        />

        <div className="space-y-2">
          <Select
            id={orderingSelectId}
            label="Rendezés"
            value={ordering}
            onChange={handleOrderingChange}
          >
            <option value="">Alapértelmezett</option>

            {RECIPE_ORDERING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onReset}
          disabled={isResetDisabled}
          fullWidth
          className="lg:w-auto lg:mt-9"
        >
          Szűrők törlése
        </Button>
      </div>
    </section>
  );
}
