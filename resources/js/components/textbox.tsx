import type { ComponentProps } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Textarea } from './ui/textarea';

export const Textbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  textareaProps = {},
  hideLabel = false,
}: Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'name' | 'control'> & {
  label: string;
  textareaProps?: ComponentProps<'textarea'>;
  hideLabel?: boolean;
}) => {
  const { autoComplete = 'on', ...rest } = textareaProps;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            {!hideLabel && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            <Textarea {...rest} {...field} id={field.name} autoComplete={autoComplete} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
