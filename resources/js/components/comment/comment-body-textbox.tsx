import { cn } from '@/lib/utils';
import type { KeyboardEvent } from 'react';
import type { ControllerProps, FieldValues } from 'react-hook-form';
import { Textbox } from '../textbox';

export const BodyTextBox = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  bodyCharactersLeft,
  onKeyDown,
}: {
  bodyCharactersLeft: number;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
} & Pick<ControllerProps<TFieldValues>, 'name' | 'control'>) => (
  <div className="w-full space-y-1.5">
    <Textbox
      control={control}
      name={name}
      label="Body"
      textareaProps={{
        className: 'h-32 resize-none p-4 break-all',
        placeholder: 'What are your thoughts?',
        onKeyDown,
      }}
      hideLabel
    />
    <div className="flex items-center justify-between">
      <p
        className={cn('text-sm', {
          'text-muted-foreground': bodyCharactersLeft >= 0,
          'text-destructive': bodyCharactersLeft < 0,
        })}
      >
        Characters left: {bodyCharactersLeft}
      </p>
      <p className="text-xs text-muted-foreground">Press Shift+Enter for new line</p>
    </div>
  </div>
);
