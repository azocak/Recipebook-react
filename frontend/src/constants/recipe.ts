export const RECIPE_TITLE_MIN = 3;
export const RECIPE_TITLE_MAX = 120;
export const RECIPE_TEXTAREA_MIN = 10;

export const RECIPE_COOKING_TIME_MIN = 1;
export const RECIPE_COOKING_TIME_MAX = 1440;

export const RECIPE_SERVINGS_MIN = 1;
export const RECIPE_SERVINGS_MAX = 20;

export const RECIPE_IMAGE_MAX_SIZE_MB = 5;
export const RECIPE_IMAGE_MAX_SIZE = RECIPE_IMAGE_MAX_SIZE_MB * 1024 * 1024;

export const RECIPE_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const RECIPE_ACCEPTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export const RECIPE_ALLOWED_ERROR_FIELDS = [
  "title",
  "ingredients",
  "instructions",
  "cooking_time",
  "servings",
  "image",
  "remove_image",
] as const;

export const RECIPE_FIELD_LABELS = {
  ingredients: "hozzávalók",
  instructions: "elkészítés",
  cooking_time: "főzési idő",
  servings: "adagok száma",
} as const;

export const RECIPE_VALIDATION_ERRORS = {
  duplicateInstructions: "Az elkészítés nem lehet ugyanaz, mint a hozzávalók.",
  imageTooLarge: `A fájl mérete nem lehet nagyobb ${RECIPE_IMAGE_MAX_SIZE_MB} MB-nál.`,
  invalidImageType: "Csak JPG, JPEG, PNG vagy WEBP formátum tölthető fel.",
  saveFailed: "Nem sikerült menteni a receptet.",
} as const;

export const RECIPE_ACCEPTED_IMAGE_LABELS = [
  "JPG",
  "JPEG",
  "PNG",
  "WEBP",
] as const;

export const RECIPE_IMAGE_ACCEPT_ATTR = [
  ...RECIPE_ACCEPTED_IMAGE_EXTENSIONS,
  ...RECIPE_ACCEPTED_IMAGE_TYPES,
].join(",");

export const RECIPE_IMAGE_HELPER_TEXT = `Opcionális. Támogatott formátumok: ${RECIPE_ACCEPTED_IMAGE_LABELS.join(", ")}. Maximum méret: ${RECIPE_IMAGE_MAX_SIZE_MB} MB.`;
