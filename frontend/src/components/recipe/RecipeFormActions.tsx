import { Button } from "../ui/Button";

type RecipeFormActionsProps = {
  submitLabel: string;
  isSubmitting: boolean;
};

export function RecipeFormActions({
  submitLabel,
  isSubmitting,
}: RecipeFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        A <span className="text-red-600">*</span> jelölt mezők kitöltése
        kötelező.
      </p>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Mentés..." : submitLabel}
      </Button>
    </div>
  );
}
