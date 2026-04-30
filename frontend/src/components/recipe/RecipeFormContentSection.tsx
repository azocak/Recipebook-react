import type { ChangeEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Textarea } from "../ui/Textarea";

type RecipeFormContentSectionProps = {
  ingredientsField: UseFormRegisterReturn<"ingredients">;
  instructionsField: UseFormRegisterReturn<"instructions">;
  ingredientsError?: string;
  instructionsError?: string;
  onIngredientsChange: ChangeEventHandler<HTMLTextAreaElement>;
  onInstructionsChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function RecipeFormContentSection({
  ingredientsField,
  instructionsField,
  ingredientsError,
  instructionsError,
  onIngredientsChange,
  onInstructionsChange,
}: RecipeFormContentSectionProps) {
  return (
    <>
      <Textarea
        id="ingredients"
        label="Hozzávalók"
        required
        rows={6}
        placeholder="Írd le a hozzávalókat, lehetőleg soronként."
        error={ingredientsError}
        hint="Például: 20 dkg liszt, 2 db tojás, 3 dl tej..."
        {...ingredientsField}
        onChange={onIngredientsChange}
      />

      <Textarea
        id="instructions"
        label="Elkészítés"
        required
        rows={8}
        placeholder="Írd le lépésről lépésre az elkészítést."
        error={instructionsError}
        {...instructionsField}
        onChange={onInstructionsChange}
      />
    </>
  );
}
