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
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label={placeholderLabel}
          className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={iconClassMap[variant]}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M21 16l-5.5-5.5L7 19" />
          </svg>

          {showPlaceholderText ? (
            <p className="text-sm font-medium text-slate-600">
              {placeholderLabel}
            </p>
          ) : (
            <span className="sr-only">{placeholderLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
