type BaseProps = {
  id: string;
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
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

export function RecipeFormField(props: RecipeFormFieldProps) {
  if (props.type === "textarea") {
    const { label, error, ...textareaProps } = props;

    return (
      <div>
        <label htmlFor={props.id} className="mb-1 block font-medium">
          {label}
        </label>

        <textarea
          {...textareaProps}
          className="w-full rounded border px-3 py-2"
        />

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const { type, label, error, ...inputProps } = props;

  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block font-medium">
        {label}
      </label>

      <input
        type={type}
        {...inputProps}
        className="w-full rounded border px-3 py-2"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
