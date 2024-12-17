import React, { useCallback, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Modal from '../index';
import uuid from 'draft-js/lib/uuid';

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

  const isSubmitClicked = useRef(false);
  const {
    handleSubmit,
    formState: { isValid, errors, touchedFields },
    trigger,
  } = methods;

  const onSubmit = useCallback(
    async (data, e) => {
      const isFormValid = await trigger();

      if (isFormValid) {
        isSubmitClicked.current = true;

        onSubmitCallback(data);
      } else {
        isSubmitClicked.current = false;

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
        isSubmitClicked={isSubmitClicked.current}
      >
        <form id={uuid()} onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
      </Modal>
    </FormProvider>
  );
};

export default FormValidatedModal;
