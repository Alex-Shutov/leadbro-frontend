import React, { useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import cn from 'classnames';
import styles from './styles.module.sass';
import Modal from '../index';
import FormTextInput from '../../Input/FormTextInput';
import FormDropdown from '../../Dropdown/FormDropdown';

// Оптимизированный компонент формы
const FormContent = React.memo(({ children, control }) => {
  const enhanceChildren = useCallback(
    (children) => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Проверяем наличие name в props
        if (!child.props?.name) {
          console.warn('Form field components must have a name prop');
          return child;
        }

        let enhancedChild = child;

        switch (child.props?.componentType) {
          case 'TextInput':
            enhancedChild = (
              <FormTextInput
                key={child.props.name}
                {...child.props}
                control={control}
              />
            );
            break;
          case 'Dropdown':
            enhancedChild = (
              <FormDropdown
                key={child.props.name}
                {...child.props}
                control={control}
              />
            );
            break;
          default:
            if (child.props?.children) {
              enhancedChild = React.cloneElement(child, {
                children: enhanceChildren(child.props.children),
              });
            }
        }

        return enhancedChild;
      });
    },
    [control],
  );

  return enhanceChildren(children);
});

FormContent.displayName = 'FormContent';

const FormValidatedModal = ({
  children,
  handleClose,
  handleSubmit: onSubmitCallback,
  size = 'lg',
  defaultValues = {},
  modalRef,
  closeButton,
  customButtons,
  cls,
  ...props
}) => {
  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
    control,
  } = methods;

  const onSubmit = useCallback(
    (data) => {
      onSubmitCallback(data);
    },
    [onSubmitCallback],
  );

  return (
    <FormProvider {...methods}>
      <Modal
        size={size}
        handleClose={handleClose}
        handleSubmit={handleSubmit(onSubmit)}
        modalRef={modalRef}
        closeButton={closeButton}
        customButtons={customButtons}
        cls={cls}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <FormContent children={children} control={control} />
        </form>
      </Modal>
    </FormProvider>
  );
};

export default FormValidatedModal;
