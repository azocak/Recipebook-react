import { FormField } from "./FormField";

type TextInputFieldProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  name: string;
  value: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete: string;
  onChange: (value: string) => void;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200";

export function TextInputField({
  id,
  label,
  type = "text",
  name,
  value,
  error,
  hint,
  required = false,
  placeholder,
  autoComplete,
  onChange,
}: TextInputFieldProps) {
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
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />
    </FormField>
  );
}
