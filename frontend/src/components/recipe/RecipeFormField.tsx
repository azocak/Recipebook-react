import { FormField } from "../auth/FormField";

type BaseProps = {
  id: string;
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  hint?: string;
  required?: boolean;
};

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    type: "text" | "number";
  };

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    type: "textarea";
  };

type RecipeFormFieldProps = InputProps | TextareaProps;

const baseFieldClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200";

export function RecipeFormField(props: RecipeFormFieldProps) {
  const describedBy = props.error
    ? `${props.id}-error`
    : props.hint
      ? `${props.id}-hint`
      : undefined;

  if (props.type === "textarea") {
    const {
      id,
      label,
      error,
      hint,
      required = false,
      className,
      ...textareaProps
    } = props;

    return (
      <FormField
        id={id}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <textarea
          id={id}
          {...textareaProps}
          className={`${baseFieldClassName} min-h-35 resize-y ${className ?? ""}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      </FormField>
    );
  }

  const {
    id,
    type,
    label,
    error,
    hint,
    required = false,
    className,
    ...inputProps
  } = props;

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={id}
        type={type}
        {...inputProps}
        className={`${baseFieldClassName} ${className ?? ""}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
    </FormField>
  );
}
