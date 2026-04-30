type RecipeImageProps = {
  imageUrl?: string | null;
  alt: string;
  placeholderLabel: string;
  placeholderIconClassName: string;
  showPlaceholderText?: boolean;
};

function ImagePlaceholderIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
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
  );
}

function RecipeImagePlaceholder({
  label,
  iconClassName,
  showText,
}: {
  label: string;
  iconClassName: string;
  showText: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400"
    >
      <ImagePlaceholderIcon className={iconClassName} />

      {showText ? (
        <p className="text-sm font-medium text-slate-600">{label}</p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

export function RecipeImage({
  imageUrl,
  alt,
  placeholderLabel,
  placeholderIconClassName,
  showPlaceholderText = false,
}: RecipeImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <RecipeImagePlaceholder
      label={placeholderLabel}
      iconClassName={placeholderIconClassName}
      showText={showPlaceholderText}
    />
  );
}
