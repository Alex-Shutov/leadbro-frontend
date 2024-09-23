import Card from '../../../../../shared/Card';
import Title from '../../../../../shared/Title';
import MultiInputContacts from '../Contacts/Inputs/MultiInput.component';
import { handleError, handleInfo } from '../../../../../utils/snackbar';
import CardInput from '../../../../../shared/Input/Card';
import React from 'react';
import styles from './Tokens.module.sass';
const ClientTokens = ({
  data,
  onRemove,
  onChange,
  onSubmit,
  onReset,
  onAdd,
}) => {
  const defaultActions = (path, success, info, copy = 'Элемент скопирован') => {
    // console.log(properties,'smile')
    return {
      copy: (text) => {
        navigator.clipboard.writeText(text).then((r) => handleInfo(copy));
      },
      // delete: ({ name }) => {
      //   onRemove(name);
      //   // setLength((prev) => ({...prev,[middleProp]:prev[middleProp]-1}))
      //   handleError('Элемент удален');
      // },
      edit: ({ name, value }) => onChange(name, value),
      submit: () => {
        onSubmit(success);
      },
      reset: () => {
        onReset(path);
        handleInfo(info);
      },
    };
  };

  return (
    <Card classTitle={styles.title} className={styles.card}>
      <Title smallTable={true} actions={{}} title={'Доступы в метрику'} />
      {/*<MultiInputContacts*/}
      {/*  onAdd={onAdd}*/}
      {/*  contactData={contactData}*/}
      {/*  label={'Токен в топвизор'}*/}
      {/*  param={'tel'}*/}
      {/*  type={'tel'}*/}
      {/*  onActions={(path) =>*/}
      {/*    defaultActions(path, 'Токен сохранен', 'Токен восстановлен')*/}
      {/*  }*/}
      {/*/>*/}
      <CardInput
        classNameLabel={styles.label}
        placeholder={'Токен'}
        label={'Токен в топвизор'}
        name={`topvisorToken`}
        type={'text'}
        value={data.topvisorToken}
        actions={defaultActions(
          'topvisorToken',
          'Токен сохранен',
          'Токен восстановлен',
        )}
      />
      <CardInput
        classNameLabel={styles.label}
        placeholder={'Токен'}
        label={'Токен в метрику'}
        name={`ymetricsToken`}
        type={'text'}
        value={data.ymetricsToken}
        actions={defaultActions(
          'ymetricsToken',
          'Токен сохранен',
          'Токен восстановлен',
        )}
      />
      {/*<MultiInputContacts*/}
      {/*  onAdd={onAdd}*/}
      {/*  contactData={contactData}*/}
      {/*  label={'Токен в метрику'}*/}
      {/*  param={'address'}*/}
      {/*  type={'textarea'}*/}
      {/*  classInput={styles.input}*/}
      {/*  onActions={(path) =>*/}
      {/*    defaultActions(path, 'Токен сохранен', 'Токен восстановлен')*/}
      {/*  }*/}
      {/*/>*/}
    </Card>
  );
};

export default ClientTokens;
