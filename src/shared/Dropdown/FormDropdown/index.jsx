import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import cn from 'classnames';
import styles from './styles.module.sass';
import Dropdown from '../Default';

const FormDropdown = React.forwardRef(
  (
    { name, label, setValue: setDropdownValue, value, required, ...props },
    ref,
  ) => {
    const {
      register,
      formState: { errors },
      setValue,
    } = useForm();

    React.useEffect(() => {
      register(name, { required: required && 'Это поле обязательно' });
    }, [register, name, required]);

    return (
      <Dropdown
        {...props}
        label={label}
        value={value}
        setValue={(val) => {
          setValue(name, val, { shouldValidate: true });
          setDropdownValue?.(val);
        }}
        className={cn(props.className, {
          [styles.invalidField]: errors[name],
        })}
        required={required}
      />
    );
  },
);

export default FormDropdown;
