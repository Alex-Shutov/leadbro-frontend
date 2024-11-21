import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import cn from 'classnames';
import styles from './styles.module.sass';
import Modal from '../index';
import FormTextInput from '../../Input/FormTextInput';
import FormDropdown from '../../Dropdown/FormDropdown';
import Icon from '../../Icon';

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
    formState: { errors, isValid },
    control,
  } = methods;

  // Функция обработки подтверждения формы
  const onSubmit = (data) => {
    console.log('Form submitted with data:', data);
    onSubmitCallback(data);
  };

  // Рекурсивная функция для клонирования дочерних элементов
  const enhanceChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      let enhancedChild = child;

      switch (child.props?.componentType) {
        case 'TextInput':
          enhancedChild = (
            <FormTextInput {...child.props} control={control} errors={errors} />
          );
          break;
        case 'Dropdown':
          enhancedChild = (
            <FormDropdown {...child.props} control={control} errors={errors} />
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
  };

  return (
    <FormProvider {...methods}>
      <Modal
        size={size}
        handleClose={handleClose}
        handleSubmit={handleSubmit(onSubmit)}
        modalRef={modalRef}
        closeButton={closeButton}
        customButtons={customButtons}
        cls={cn(cls, {
          [styles.hasErrors]: Object.keys(errors).length > 0,
        })}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          {enhanceChildren(children)}

          {Object.keys(errors).length > 0 && (
            <div className={styles.errorSummary}>
              {Object.entries(errors).map(([field, error]) => (
                <div key={field} className={styles.errorItem}>
                  <Icon name="warning" size={16} />
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </Modal>
    </FormProvider>
  );
};

export default FormValidatedModal;
