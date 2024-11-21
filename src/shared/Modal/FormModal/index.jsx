import React, { useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Modal from '../index';

const FormValidatedModal = ({
  children,
  handleClose,
  handleSubmit: onSubmitCallback,
  defaultValues = {},
  ...props
}) => {
  const methods = useForm({
    defaultValues,
    mode: 'onTouched', // Изменяем режим валидации
    reValidateMode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid, errors, touchedFields },
    trigger,
  } = methods;

  const onSubmit = useCallback(
    async (data, e) => {
      const isFormValid = await trigger();

      if (isFormValid) {
        onSubmitCallback(data);
      } else {
        e?.preventDefault();
      }
    },
    [onSubmitCallback, trigger],
  );

  return (
    <FormProvider {...methods}>
      <Modal
        {...props}
        handleClose={handleClose}
        handleSubmit={handleSubmit(onSubmit)}
      >
        <form onSubmit={(e) => e.preventDefault()}>{children}</form>
      </Modal>
    </FormProvider>
  );
};

export default FormValidatedModal;
