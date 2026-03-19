type BaseProps = {
  id: string;
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
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
    const { label, ...textareaProps } = props;

    return (
      <div>
        <label htmlFor={props.id} className="mb-1 block font-medium">
          {label}
          <textarea
            {...textareaProps}
            className="w-full rounded border px-3 py-2"
          />
        </label>
      </div>
    );
  }

  const { type, label, ...inputProps } = props;

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
    </div>
  );
}
