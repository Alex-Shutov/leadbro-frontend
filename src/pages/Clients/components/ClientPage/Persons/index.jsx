import React, { useState } from 'react';
import Card from '../../../../../shared/Card';
import styles from './Persons.module.sass';
import CardDropdown from '../../../../../shared/Dropdown/Card';
import Title from '../../../../../shared/Title';
import CardInput from '../../../../../shared/Input/Card';
import {
  handleError,
  handleInfo,
  handleSubmit,
} from '../../../../../utils/snackbar';
import { motion } from 'framer-motion';
import { TranslateYTransition } from '../../../../../utils/motion.variants';
import Image from '../../../../../shared/Image';
import { Link } from 'react-router-dom';
import { createBaseMessengerLinksByName } from '../../../../../utils/create.utils';
import useMappedObj from "../../../../../hooks/useMappedObj";

const ClientPersons = ({ persons, onChange, onSubmit, onReset, onAdd }) => {
  const mappedPersons = useMappedObj(persons);

  const defaultActions = ({
                            path,
                            success,
                            info,
                            clientId,
                            copy = 'Элемент скопирован',
                          }) => {
    return {
      copy: (text) => {
        navigator.clipboard.writeText(text).then((r) => handleInfo(copy));
      },
      // delete: ({ name, value }) => onChange(name, ''),
      edit: ({ name, value }) => onChange(name, value),
      submit: () => {
        onSubmit(clientId);
        handleSubmit(success);
      },
      reset: () => {
        onReset(path);
        handleInfo(info);
      },
    }
  };
  return (
      <Card classTitle={styles.title} className={styles.card}>
        <Title
            smallTable={true}
            actions={{
              add: {
                action: () => onAdd(),
                title: 'Добавить клиента',
              },
            }}
            title={'Контактные лица'}
        />
        {mappedPersons?.map(([key,el]) => {
          const values = el;
          return (
              <CardDropdown  inputComponent={()=><CardInput
                  name={`contactPersons.${values.id}.fio`}
                  // class
                  classInput={styles.fioInput}
                  type={'text'}
                  value={values.fio}
                  actions={defaultActions(
                      `contactPersons.${values.id}.fio`,
                      'ФИО сохранено',
                      'ФИО восстановлено',
                      values.id,
                  )}
              />} className={styles.dropdown} text={<b>{values.fio}</b>}>
                <motion.div>
                  <CardInput
                      name={`contactPersons.${values.id}.role`}
                      type={'text'}
                      value={values.role}
                      actions={defaultActions(
                          `contactPersons.${values.id}.role`,
                          'Роль сохранена',
                          'Роль восстановлена',
                          values.id,
                      )}
                  />
                  <CardInput
                      label={'Телефон'}
                      name={`contactPersons.${values.id}.tel`}
                      type={'tel'}
                      value={values.tel}
                      actions={defaultActions(
                          `contactPersons.${values.id}.tel`,
                          'Телефон сохранен',
                          'Телефон восстановлен',
                          values.id,

                      )}
                  />
                  <CardInput
                      label={'Почта'}
                      name={`contactPersons.${values.id}.email`}
                      type={'email'}
                      value={values.email}
                      actions={defaultActions(
                          `contactPersons.${values.id}.email`,
                          'Почта сохранена',
                          'Почта восстановлена',
                          values.id,

                      )}
                  />
                  {values.messengers.length && (
                      <div className={styles.messengers_container}>
                        <p>Мессенджеры</p>
                        <div className={styles.messengers}>
                          {values.messengers.map((messenger, index) => {
                            console.log(messenger, 'messenger');
                            return (
                                <Link
                                    target="_blank"
                                    to={
                                        messenger.whatsapp ??
                                        messenger.telegram ??
                                        messenger.viber
                                    }
                                >
                                  <Image
                                      className={styles.messengers_icon}
                                      src={`/leadbro/${Object.keys(messenger)[0]}.svg`}
                                      alt={`${Object.keys(messenger)[0]}`}
                                  />
                                </Link>
                            );
                          })}
                        </div>
                      </div>
                  )}
                </motion.div>
                {/*<CardInput label={'Почта'} name={`contactPersons.${values.id}.email`} type={'email'} value={values.email} actions={defaultActions(`contactPersons.${values.id}.email`,'Почта сохранена','Почта восстановлена')}/>*/}
              </CardDropdown>
          );
        })}
      </Card>
  );
};

export default ClientPersons;
