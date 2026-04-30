import type { ChangeEvent } from "react";

import {
  RECIPE_IMAGE_ACCEPT_ATTR,
  RECIPE_IMAGE_HELPER_TEXT,
} from "../../constants/recipe";
import { Button } from "../ui/Button";
import { RecipeImageBlock } from "./RecipeImageBlock";

type RecipeFormImageSectionProps = {
  displayedImageUrl: string | null;
  imageError?: string;
  removeImageError?: string;
  removeImage: boolean;
  hasSelectedImage: boolean;
  hasExistingImage: boolean;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedImage: () => void;
  onToggleRemoveExistingImage: () => void;
};

export function RecipeFormImageSection({
  displayedImageUrl,
  imageError,
  removeImageError,
  removeImage,
  hasSelectedImage,
  hasExistingImage,
  onImageChange,
  onRemoveSelectedImage,
  onToggleRemoveExistingImage,
}: RecipeFormImageSectionProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-semibold text-slate-900">
          Receptkép
        </label>

        <p className="text-sm text-slate-500">{RECIPE_IMAGE_HELPER_TEXT}</p>
      </div>

      <RecipeImageBlock
        imageUrl={displayedImageUrl}
        alt="Receptkép előnézet"
        variant="editor"
      />

      <div className="space-y-3">
        <input
          id="image"
          name="image"
          type="file"
          accept={RECIPE_IMAGE_ACCEPT_ATTR}
          onChange={onImageChange}
          className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          aria-invalid={Boolean(imageError)}
          aria-describedby={imageError ? "image-error" : undefined}
        />

        <div className="flex flex-wrap gap-3">
          {hasSelectedImage ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onRemoveSelectedImage}
            >
              Kiválasztott kép eltávolítása
            </Button>
          ) : null}

          {hasExistingImage && !hasSelectedImage ? (
            <Button
              type="button"
              variant={removeImage ? "danger" : "secondary"}
              onClick={onToggleRemoveExistingImage}
            >
              {removeImage
                ? "Képtörlés visszavonása"
                : "Jelenlegi kép törlése mentéskor"}
            </Button>
          ) : null}
        </div>

        {removeImage && !hasSelectedImage ? (
          <p className="text-sm text-amber-700">
            A jelenlegi kép a mentés után törlődni fog.
          </p>
        ) : null}

        {imageError ? (
          <p id="image-error" className="text-sm text-red-600" role="alert">
            {imageError}
          </p>
        ) : null}

        {removeImageError ? (
          <p className="text-sm text-red-600" role="alert">
            {removeImageError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
