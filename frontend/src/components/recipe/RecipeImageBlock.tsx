import { RecipeImage } from "./RecipeImage";

type RecipeImageVariant = "card" | "detail" | "editor";

type RecipeImageBlockProps = {
  imageUrl?: string | null;
  alt: string;
  variant?: RecipeImageVariant;
  placeholderLabel?: string;
};

const wrapperClassMap: Record<RecipeImageVariant, string> = {
  card: "aspect-video rounded-t-3xl bg-slate-100",
  detail: "aspect-video rounded-3xl border border-slate-200 bg-slate-100",
  editor: "aspect-video rounded-2xl border border-slate-200 bg-slate-100",
};

const iconClassMap: Record<RecipeImageVariant, string> = {
  card: "h-10 w-10",
  detail: "h-14 w-14",
  editor: "h-10 w-10",
};

export function RecipeImageBlock({
  imageUrl,
  alt,
  variant = "card",
  placeholderLabel = "Nincs feltöltött kép",
}: RecipeImageBlockProps) {
  const showPlaceholderText = variant === "editor";

  return (
    <div className={`overflow-hidden ${wrapperClassMap[variant]}`}>
      <RecipeImage
        imageUrl={imageUrl}
        alt={alt}
        placeholderLabel={placeholderLabel}
        placeholderIconClassName={iconClassMap[variant]}
        showPlaceholderText={showPlaceholderText}
      />
    </div>
  );
}
