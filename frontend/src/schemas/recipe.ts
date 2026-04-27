import { z } from "zod";
import {
  RECIPE_ACCEPTED_IMAGE_EXTENSIONS,
  RECIPE_ACCEPTED_IMAGE_TYPES,
  RECIPE_COOKING_TIME_MAX,
  RECIPE_COOKING_TIME_MIN,
  RECIPE_FIELD_LABELS,
  RECIPE_IMAGE_MAX_SIZE,
  RECIPE_SERVINGS_MAX,
  RECIPE_SERVINGS_MIN,
  RECIPE_TEXTAREA_MIN,
  RECIPE_TITLE_MAX,
  RECIPE_TITLE_MIN,
  RECIPE_VALIDATION_ERRORS,
} from "../constants/recipe";

const RECIPE_REQUIRED_ERRORS = {
  title: "A recept neve kötelező.",
  ingredients: "A(z) hozzávalók mező kötelező.",
  instructions: "A(z) elkészítés mező kötelező.",
  cooking_time: "A(z) főzési idő mező kötelező.",
  servings: "A(z) adagok száma mező kötelező.",
} as const;

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createRequiredTrimmedTextSchema(
  requiredError: string,
  minLength: number,
  minLengthError: string,
) {
  return z
    .string({ error: requiredError })
    .trim()
    .min(1, { error: requiredError })
    .min(minLength, { error: minLengthError });
}

function createNumberFieldSchema(
  fieldLabel: string,
  requiredError: string,
  min: number,
  max: number,
  unit = "",
) {
  const suffix = unit ? ` ${unit}` : "";

  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed) {
          return undefined;
        }

        return Number(trimmed);
      }

      return value;
    },
    z
      .number({ error: requiredError })
      .int({ error: `A(z) ${fieldLabel} mezőbe egész számot adj meg.` })
      .min(min, {
        error: `A(z) ${fieldLabel} legalább ${min}${suffix} legyen.`,
      })
      .max(max, {
        error: `A(z) ${fieldLabel} legfeljebb ${max}${suffix} lehet.`,
      }),
  );
}

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function isSupportedImageFile(file: File) {
  const fileName = file.name.toLowerCase();
  const hasSupportedExtension = RECIPE_ACCEPTED_IMAGE_EXTENSIONS.some(
    (extension) => fileName.endsWith(extension),
  );

  return (
    RECIPE_ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof RECIPE_ACCEPTED_IMAGE_TYPES)[number],
    ) || hasSupportedExtension
  );
}

export const recipeImageSchema = z
  .custom<File | null | undefined>((value) => value == null || isFile(value), {
    error: "Érvénytelen képfájl.",
  })
  .refine((file) => file == null || file.size <= RECIPE_IMAGE_MAX_SIZE, {
    error: RECIPE_VALIDATION_ERRORS.imageTooLarge,
  })
  .refine((file) => file == null || isSupportedImageFile(file), {
    error: RECIPE_VALIDATION_ERRORS.invalidImageType,
  });

export const recipeSchema = z
  .object({
    title: createRequiredTrimmedTextSchema(
      RECIPE_REQUIRED_ERRORS.title,
      RECIPE_TITLE_MIN,
      `A recept neve legalább ${RECIPE_TITLE_MIN} karakter legyen.`,
    ).max(RECIPE_TITLE_MAX, {
      error: `A recept neve legfeljebb ${RECIPE_TITLE_MAX} karakter lehet.`,
    }),

    ingredients: createRequiredTrimmedTextSchema(
      RECIPE_REQUIRED_ERRORS.ingredients,
      RECIPE_TEXTAREA_MIN,
      `A(z) ${RECIPE_FIELD_LABELS.ingredients} mező legalább ${RECIPE_TEXTAREA_MIN} karakter legyen.`,
    ),

    instructions: createRequiredTrimmedTextSchema(
      RECIPE_REQUIRED_ERRORS.instructions,
      RECIPE_TEXTAREA_MIN,
      `A(z) ${RECIPE_FIELD_LABELS.instructions} mező legalább ${RECIPE_TEXTAREA_MIN} karakter legyen.`,
    ),

    cooking_time: createNumberFieldSchema(
      RECIPE_FIELD_LABELS.cooking_time,
      RECIPE_REQUIRED_ERRORS.cooking_time,
      RECIPE_COOKING_TIME_MIN,
      RECIPE_COOKING_TIME_MAX,
      "perc",
    ),

    servings: createNumberFieldSchema(
      RECIPE_FIELD_LABELS.servings,
      RECIPE_REQUIRED_ERRORS.servings,
      RECIPE_SERVINGS_MIN,
      RECIPE_SERVINGS_MAX,
    ),

    image: recipeImageSchema.optional(),
    remove_image: z.boolean().optional(),
  })
  .refine(
    (data) =>
      normalizeText(data.ingredients).toLowerCase() !==
      normalizeText(data.instructions).toLowerCase(),
    {
      path: ["instructions"],
      error: RECIPE_VALIDATION_ERRORS.duplicateInstructions,
    },
  );

export type RecipeSchemaValues = z.infer<typeof recipeSchema>;
export type RecipeSchemaInputValues = z.input<typeof recipeSchema>;
