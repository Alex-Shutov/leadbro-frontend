import Dropdown from '../../../../../../shared/Dropdown/Default';
import Modal from '../../../../../../shared/Modal';
import TextInput from '../../../../../../shared/TextInput';
import ValuesSelector from '../../../../../../shared/Selector';
import styles from './Modal.module.sass';
import useBills from '../../../../hooks/useBills';
import useClients from '../../../../../Clients/hooks/useClients';
import useLegals from '../../../../../Settings/hooks/useLegals';
import useBillsApi from '../../../../bills.api';
import React, { useEffect, useMemo, useState } from 'react';
import { handleSubmit as handleSubmitSnackbar } from '../../../../../../utils/snackbar';
import TextLink from '../../../../../../shared/Table/TextLink';
import Calendar from '../../../../../../shared/Datepicker';
import { billStatusTypesRu } from '../../../../bills.types';
import cn from 'classnames';
import {useSelectorClients, useSelectorCompanies} from '../../../../../../hooks/useSelectors';
import useAppApi from '../../../../../../api';
import useStore from '../../../../../../hooks/useStore';
import { observer } from 'mobx-react';
import taskStyles
  from "../../../../../Stages/components/StagesPage/components/StagesTable/components/EditModal/components/TaskDescriptionPart/Description.module.sass";
import ServiceItems from "./components/ServiceItems";

const EditModal = observer(({ billId, onClose }) => {
  const { store: billsStore } = useBills();
  const appApi = useAppApi();
  const { appStore } = useStore();
  // const {
  //   data: { clients },
  // } = useClients();
  // const {
  //   data: { legalEntities },
  // } = useLegals();
  const api = useBillsApi();

  const [isEditMode, setIsEditMode] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  // const { data, loading } = useSelectorCompanies(companySearchTerm);
  const [localBill, setLocalBill] = useState({
    number: '',
    creationDate: new Date(),
    paymentDate: new Date(),
    legalEntity: null,
    company: null,
    status: 'created',
    paymentReason:'',

    items: [],
  });

  const bill = useMemo(() => {
    return isEditMode ? billsStore.getById(billId) : localBill;
  }, [isEditMode, billId, billsStore.bills, billsStore.drafts, localBill]);

  useEffect(() => {
    if (billId) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [billId]);

  const handleChange = (name, value, withId = true) => {
    if (isEditMode) {
      billsStore.changeById(billId, name, value, withId);
    } else {
      setLocalBill((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await api.updateBill(billId, bill);
      } else {
        await api.createBill({
          ...localBill,
          legalEntityId: localBill.legalEntity?.id ?? 0,
          companyId: localBill.company?.id ?? 0,
        });
      }
      handleSubmitSnackbar(
        isEditMode ? 'Счет успешно отредактирован' : 'Счет успешно создан',
      );
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleReset = () => {
    if (isEditMode) {
      billsStore.resetDraft(billId);
    }
    onClose();
  };
  console.log(appStore, 'companies');
  return (
    <Modal handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
      <div className={styles.name}>
        {isEditMode ? 'Редактирование счета' : 'Создание счета'}
      </div>
      <Dropdown
        isAsync={true}
        asyncSearch={async (search) => {
          const response = await appApi.getCompanies(search);
          return response;
        }}
        setValue={(e) => handleChange('company', e)}
        classNameContainer={styles.input}
        label={'Получатель платежа'}
        value={bill.company}
        renderValue={(val) => val.name}
        renderOption={(opt) => opt.name}
        options={appStore?.companies ?? []}
      />
      <div className={cn(styles.flex, styles.addZIndex)}>
        <Calendar
          label={'Дата создания'}
          value={bill?.creationDate}
          onChange={(date) => handleChange('creationDate', date)}
        />
        <Calendar
          label={'План. дата платежа'}
          value={bill?.paymentDate}
          onChange={(date) => handleChange('paymentDate', date)}
        />
      </div>

      <TextInput
          onChange={({ target }) => handleChange(target.name, target.value)}
          name={'payment_reason'}
          value={bill?.paymentReason}
          rows={6}
          edited={true}
          placeholder={'Введите комментарий'}
          className={cn(taskStyles.input, taskStyles.textarea)}
          label={'Основание платежа'}
      />

      {/*<ValuesSelector*/}
      {/*  placeholder={'Юридическое лицо'}*/}
      {/*  onChange={(e) =>*/}
      {/*    handleChange(*/}
      {/*      'legalEntity',*/}
      {/*      e.length ? legalEntities.find((el) => el.id === e[0]?.value) : null,*/}
      {/*    )*/}
      {/*  }*/}
      {/*  isMulti={false}*/}
      {/*  label={'Юридическое лицо'}*/}
      {/*  options={legalEntities.map((el) => ({ value: el.id, label: el.name }))}*/}
      {/*  value={*/}
      {/*    bill.legalEntity*/}
      {/*      ? { value: bill.legalEntity.id, label: bill.legalEntity.name }*/}
      {/*      : null*/}
      {/*  }*/}
      {/*/>*/}
      <ValuesSelector
          minInputLength={4}

        placeholder={'Клиент'}
        onChange={(e) =>
          handleChange(
            'company',
            e.length ? appStore?.companies.find((el) => el.id === e[0]?.value) : null,
          )
        }
        isMulti={false}
        label={
          <div className={styles.client_label}>
            Клиент<TextLink>Создать клиента</TextLink>
          </div>
        }
          isAsync
          asyncSearch={async (query) => {
            const response = await appApi.getCompanies(query);
            const data = response
            return data.map(item => ({
              value: item.id,
              label: item.name
            }));
          }}
        value={
          bill.company
            ? { value: bill.company.id, label: bill.company.name }
            : null
        }
      />
      {/*<div className={styles.lowZIndex}>*/}
      {/*  <Dropdown*/}
      {/*    setValue={(e) => handleChange('status', e[0])}*/}
      {/*    classNameContainer={styles.input}*/}
      {/*    label={'Статус'}*/}
      {/*    value={billStatusTypesRu[bill.status] || ''}*/}
      {/*    renderOption={(opt) => opt[1]}*/}
      {/*    options={Object.entries(billStatusTypesRu)}*/}
      {/*  />*/}
      {/*</div>*/}
      <ServiceItems
          items={bill.items}
          onChange={(items) => handleChange('items', items, false)}
      />
    </Modal>
  );
});

export default EditModal;
