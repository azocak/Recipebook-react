import type { ChangeEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import {
  RECIPE_COOKING_TIME_MAX,
  RECIPE_COOKING_TIME_MIN,
  RECIPE_SERVINGS_MAX,
  RECIPE_SERVINGS_MIN,
  RECIPE_TITLE_MAX,
} from "../../constants/recipe";
import { Input } from "../ui/Input";

type RecipeFormBasicsSectionProps = {
  titleField: UseFormRegisterReturn<"title">;
  cookingTimeField: UseFormRegisterReturn<"cooking_time">;
  servingsField: UseFormRegisterReturn<"servings">;
  titleError?: string;
  cookingTimeError?: string;
  servingsError?: string;
  onTitleChange: ChangeEventHandler<HTMLInputElement>;
  onCookingTimeChange: ChangeEventHandler<HTMLInputElement>;
  onServingsChange: ChangeEventHandler<HTMLInputElement>;
};

export function RecipeFormBasicsSection({
  titleField,
  cookingTimeField,
  servingsField,
  titleError,
  cookingTimeError,
  servingsError,
  onTitleChange,
  onCookingTimeChange,
  onServingsChange,
}: RecipeFormBasicsSectionProps) {
  return (
    <>
      <Input
        id="title"
        label="Recept neve"
        type="text"
        required
        maxLength={RECIPE_TITLE_MAX}
        placeholder="pl. Házi palacsinta"
        error={titleError}
        hint="Adj rövid, jól érthető címet a receptnek."
        {...titleField}
        onChange={onTitleChange}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="cooking_time"
          label="Főzési idő (perc)"
          type="number"
          required
          min={RECIPE_COOKING_TIME_MIN}
          max={RECIPE_COOKING_TIME_MAX}
          placeholder="pl. 30"
          error={cookingTimeError}
          {...cookingTimeField}
          onChange={onCookingTimeChange}
        />

        <Input
          id="servings"
          label="Adagok száma"
          type="number"
          required
          min={RECIPE_SERVINGS_MIN}
          max={RECIPE_SERVINGS_MAX}
          placeholder="pl. 4"
          error={servingsError}
          {...servingsField}
          onChange={onServingsChange}
        />
      </div>
    </>
  );
}
