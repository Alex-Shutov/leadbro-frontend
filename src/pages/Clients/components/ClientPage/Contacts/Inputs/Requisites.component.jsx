import React, { useMemo } from 'react';
import CardInput from '../../../../../../shared/Input/Card';
import MultiInputLabeled from '../../../../../../shared/Input/MultiLabeled/MultiLabeledInputs';
import { createRequisites } from '../../../../clients.mocks';

const RequisitesToValues = {
  // TODO Добавить реальный и фактический дарсес
  INN: 'ИНН',
  BankName: 'Наименование банка',
  KPP: 'КПП',
  OGRN: 'ОГРН/ОГРНИП',
  RS: 'Р/с №',
  CORR_RS: 'Корр/с №',
  BIK: 'БИК банка',
};
const RequisitesOnSave = {
  INN: 'ИНН сохранен',
  BankName: 'Наименование банка сохранено',
  KPP: 'КПП сохранен ',
  OGRN: 'ОГРН/ОГРНИП сохранено',
  RS: 'Расчетный счет сохранен',
  CORR_RS: 'Корреспондентский счет сохранен',
  BIK: 'БИК сохранен',
};

const RequisitesOnClose = {
  INN: 'ИНН восстановлен',
  BankName: 'Наименование банка восстановлено',
  KPP: 'КПП восстановлен',
  OGRN: 'ОГРН/ОГРНИП восстановлено',
  RS: 'Расчетный счет восстановлен',
  CORR_RS: 'Корреспондентский счет восстановлен',
  BIK: 'БИК восстановлен',
};
const RequisitesComponent = ({ label, contactData, onActions, onAdd }) => {
  const length = useMemo(
    () => Object.keys(contactData?.requisites ?? {}).length,
    [contactData.requisites],
  );

  return (
    <MultiInputLabeled label={label}>
      {Object.entries(contactData?.requisites ?? {}).map(
        ([key, value], index) => {
          return Object.entries(value).map(
            ([keyRequisites, valueRequisites], index) => {
              const actions = onActions(
                `contactData.requisites.${key}.${keyRequisites}`,
                RequisitesOnSave[keyRequisites],
                RequisitesOnClose[keyRequisites],
              );
              return (
                <CardInput
                  placeholder={`${RequisitesToValues[keyRequisites]}...`}
                  multiple={true}
                  labeled={true}
                  label={RequisitesToValues[keyRequisites]}
                  name={`contactData.requisites.${key}.${keyRequisites}`}
                  type={'textarea'}
                  value={valueRequisites}
                  actions={actions}
                />
              );
            },
          );
        },
      )}
    </MultiInputLabeled>
  );
};

export default RequisitesComponent;
