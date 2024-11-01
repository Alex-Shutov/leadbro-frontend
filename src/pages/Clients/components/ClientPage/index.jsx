import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import useStore from '../../../../hooks/useStore';
import { observer } from 'mobx-react';
import styles from './Client.module.sass';
import Title from '../../../../shared/Title';
import ClientStatus from './Status';
import cn from 'classnames';
import ClientService from './Services';
import ClientDeals from './Deals';
import ClientActivities from './Activities';
import ClientDescription from './Description';
import useClientsApi from '../../clients.api';
import ClientPersons from './Persons';
import { deepObserve } from 'mobx-utils';
import { reaction } from 'mobx';
import ClientsContacts from './Contacts';
import ClientPasswords from './Passwords';
import ClientComments from './Comments';
import CardDropdown from '../../../../shared/Dropdown/Card';
import { AnimatePresence } from 'framer-motion';
import {
  opacityTransition,
  TranslateYTransition,
} from '../../../../utils/motion.variants';
import { motion } from 'framer-motion';
import useClients from '../../hooks/useClients';
import ClientTokens from './Tokens';
import CreateModal from './Passwords/Modals/CreateModal';
import CreatePassModal from './Passwords/Modals/CreateModal';
import {LoadingProvider} from "../../../../providers/LoadingProvider";
import {handleSubmit as handleSubmitSnackbar} from "../../../../utils/snackbar";

const ClientPage = observer(() => {
  let { id } = useParams();
  const { data: client, store: clients } = useClients(+id);
  const api = useClientsApi();
  const [dropDownClicked, setDropDownCLicked] = useState(true);
  const [passModalOpen, setPassModalOpen] = useState(false);

  const handleChange = (name, payload, withId = true) => {
    debugger
    clients.changeById(client?.id ?? +id, name, payload, withId);
  };
  const handleReset = (path) => {
    clients.resetDraft(client.id, path);
  };

  const handleRemove = (path) => {
    clients.removeById(client.id, path);
  };
  const handleRemovePass = (path, passId) => {
    api.deletePassword(client.id, passId);

    handleRemove(path);
  };
  const handleSubmit = async(path,submitText) => {
    try {
      await api.updateCompany(Number(id), {}, submitText);
      clients.submitDraft();
      // api.setClients(clients);
    }
    catch (error) {
      console.error('Ошибка при сохранении:', error);
      clients.resetDraft(Number(id),path)

    }
  };

  const handleSubmitPersons = async (clientId,submitText,path) => {
    try {
      await api.updateClient(Number(id),clientId,submitText)
      clients.submitDraft()

    }
    catch (error) {
      console.error('Ошибка при сохранении:', error);
      clients.resetDraft(Number(id),path)
    }

  }

  const handleSubmitPasswords = async (path,passId,submitText) => {
    try {
      await api.updatePasswords(Number(id), passId).then(()=>handleSubmitSnackbar(submitText));
      clients.submitDraft();


    }
    catch (error) {
      console.error('Ошибка при сохранении:', error);
      clients.resetDraft(Number(id),path)

    }
  };

  return (
    <motion.div
      initial={'hidden'}
      animate={'show'}
      variants={opacityTransition}
    >
      <LoadingProvider isLoading={api.isLoading}>
      <Title title={client?.title} />
      <div className={styles.dropdown}>
        <CardDropdown
          onClick={() => setDropDownCLicked(!dropDownClicked)}
          size={16}
          className={styles.dropdown_inner}
          text={<b>Информация о клиенте</b>}
        />
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <ClientStatus
            className={cn(styles.card, styles.card_status)}
            client={client}
          />
          <ClientService
              currentClient={client}
            className={cn(styles.card, styles.card_status)}
            services={
              client?.services?.value ? [client?.services?.value] : null
            }
          />
          <ClientDeals
            className={cn(styles.card, styles.card_status)}
            deals={client?.deals}
          />
          <ClientActivities activities={client?.activities} />
          <ClientComments onChange={handleChange} comments={client?.comments} />
        </div>
        <AnimatePresence>
          {dropDownClicked && (
            <motion.div
              animate={'show'}
              initial={'hidden'}
              exit={'hidden'}
              variants={TranslateYTransition}
              className={cn(styles.col, {
                [styles.col_dropdowned]: dropDownClicked,
              })}
            >
              <ClientDescription
                clientId={client?.id}
                onChange={handleChange}
                onReset={handleReset}
                onSubmit={handleSubmit}
                description={client?.description}
              />
              <ClientPersons
                onChange={handleChange}
                onReset={handleReset}
                onSubmit={handleSubmitPersons}
                persons={client?.contactPersons}
              />
              {client?.contactData && (
                <ClientsContacts
                  onAdd={(name, payload) => handleChange(name, payload ?? '')}
                  onRemove={handleRemove}
                  onChange={handleChange}
                  onReset={handleReset}
                  onSubmit={handleSubmit}
                  contactData={client?.contactData}
                />
              )}
              <ClientTokens
                onRemove={handleRemove}
                onChange={handleChange}
                onReset={handleReset}
                onSubmit={handleSubmit}
                data={{
                  ymetricsToken: client?.ymetricsToken,
                  topvisorToken: client?.topvisorToken,
                }}
              />
              <ClientPasswords
                onAdd={() => setPassModalOpen(true)}
                onRemove={handleRemovePass}
                onChange={handleChange}
                onReset={handleReset}
                onSubmit={handleSubmitPasswords}
                passwordsData={client?.passwords}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {passModalOpen && client && (
        <CreatePassModal
          onClose={() => setPassModalOpen(false)}
          companyId={client?.id}
        />
      )}
      </LoadingProvider>
    </motion.div>
  );
});

export default ClientPage;
