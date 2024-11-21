import React from 'react';
import { useController } from 'react-hook-form';
import cn from 'classnames';
import styles from './styles.module.sass';
import TextInput from '../../TextInput';

const FormTextInput = React.forwardRef(
  (
    { name, label, onChange, value, required, control, errors, ...props },
    ref,
  ) => {
    const {
      field,
      fieldState: { error },
    } = useController({
      name,
      control,
      rules: {
        required: required && 'Это поле обязательно',
      },
      defaultValue: value || '',
    });

    const handleChange = (e) => {
      field.onChange(e);
      onChange?.(e);
    };

    return (
      <TextInput
        {...props}
        {...field}
        label={label}
        onChange={handleChange}
        className={cn(props.className, {
          [styles.invalidField]: error,
        })}
        required={required}
        error={error?.message}
      />
    );
  },
);

export default FormTextInput;
