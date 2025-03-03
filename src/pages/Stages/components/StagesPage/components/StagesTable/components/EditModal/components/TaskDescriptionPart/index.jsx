import React, { useEffect, useState } from 'react';
import StageBadge, { StageStatuses } from '../../../StagesBadge';
import Button from '../../../../../../../../../../shared/Button';
import TextInput from '../../../../../../../../../../shared/TextInput';
import Dropdown from '../../../../../../../../../../shared/Dropdown/Default';
import TextLink from '../../../../../../../../../../shared/Table/TextLink';
import CommentsList from '../../../../../../../../../../components/CommentsList';
import useTemplatesTypes from '../../../../../../../../hooks/useTemplatesTypes';
import useServiceTypes from '../../../../../../../../../Services/hooks/useServiceTypes';
import useServices from '../../../../../../../../../Services/hooks/useServices';
import styles from './Description.module.sass';
import cn from 'classnames';
import { observer } from 'mobx-react';
import ValuesSelector from '../../../../../../../../../../shared/Selector';
import { colorStatusTypes } from '../../../../../../../../../Clients/clients.types';
import StatusDropdown from '../../../../../../../../../../components/StatusDropdown';
import { colorTasksTypes } from '../../../../../../../../../Tasks/tasks.types';
import {
  colorStatusTaskTypes,
  colorStatusTaskTypesForTaskList,
} from '../../../../../../../../stages.types';
import Loader from "../../../../../../../../../../shared/Loader";
const Index = ({
  data: {
    comments,
    description,
    id,
    comment,
    template,
    service,
    title,
    status,
  },
  selectedStatus,
  prefix,
  handleChange,
  handleSave,
  handleDecline,
  className,
    isLoading
}) => {
  return (
    <div className={cn(styles.border_container, className)}>
      <div className={styles.buttons}>
        <div className={styles.buttons_actions}>

          <StatusDropdown
            name={`${prefix}taskStatus`}
            required={true}
            statuses={colorStatusTaskTypes}
            value={colorStatusTaskTypes[selectedStatus]}
            onChange={(option) =>
              handleChange(`${prefix}taskStatus`, option.key)
            }
          />
        </div>
        <div></div>
      </div>

      <TextInput
        required={true}
        classLabel={styles.input_label}
        onChange={({ target }) => handleChange(target.name, target.value)}
        name={`${prefix}title`}
        value={title}
        edited={true}
        className={styles.input}
        label={'Задача'}
      />

      {/*/>*/}
      { isLoading ? <Loader className={styles.loader}/> : description && (
        <TextInput
          onChange={({ target }) => {
            handleChange(target.name, target.value === '' ? ' ' : target.value);
          }}
          name={`${prefix}description`}
          value={description === '' || description == null ? ' ' : description}
          edited={true}
          type={'editor'}
          className={cn(styles.input, styles.textarea)}
          label={'Описание'}
        />
      )}
    </div>
  );
};

export default Index;
