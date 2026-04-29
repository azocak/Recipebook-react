import { ErrorState } from "../ui/ErrorState";
import {
  getForbiddenTitle,
  type RecipeQueryErrorMode,
  type RecipeQueryErrorStatus,
} from "./recipeQueryErrorStateUtils";

type RecipeQueryErrorStateProps = {
  status: RecipeQueryErrorStatus;
  errorMessage: string;
  mode: RecipeQueryErrorMode;
  onBackToRecipes: () => void;
};

export function RecipeQueryErrorState({
  status,
  errorMessage,
  mode,
  onBackToRecipes,
}: RecipeQueryErrorStateProps) {
  if (status === "invalid-id") {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          eyebrow="Hibás hivatkozás"
          visual="🧭"
          title="Érvénytelen receptazonosító."
          description={errorMessage}
          secondaryActionLabel="Vissza a receptekhez"
          onSecondaryAction={onBackToRecipes}
        />
      </section>
    );
  }

  if (status === "forbidden") {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          eyebrow="Hozzáférés megtagadva"
          visual="🔒"
          title={getForbiddenTitle(mode)}
          description={errorMessage}
          secondaryActionLabel="Vissza a receptekhez"
          onSecondaryAction={onBackToRecipes}
        />
      </section>
    );
  }

  if (status === "not-found") {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          eyebrow="Eltűnt recept"
          visual="🔎"
          title="Nincs ilyen recept."
          description="A keresett recept nem található."
          secondaryActionLabel="Vissza a receptekhez"
          onSecondaryAction={onBackToRecipes}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorState
        eyebrow="Betöltési hiba"
        visual="⚠️"
        title="Nem sikerült betölteni a receptet."
        description={errorMessage}
      />
    </section>
  );
}
