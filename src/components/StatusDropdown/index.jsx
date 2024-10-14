import React, { useCallback, useMemo, useState } from 'react';
import cn from "classnames";
import styles from '../../shared/Dropdown/Default/Dropdown.module.sass';
import Dropdown from "../../shared/Dropdown/Default";
import useUnits from "../../hooks/useUnits";
import {formatDuration, formatUnts} from "../../utils/format.string";

const StatusDropdown =(
    {
       options,
       value, onChange
    }
) => {
    const statuses = options.map((el, idx) => el.label+'_'+idx);

    return (
        <Dropdown
            classNameContainer={cn(styles.statusDropdown, styles[value.className])}
            options={statuses}
            value={value.label}
            renderOption={(opt) => opt.split('_')[0]}
            setValue={(e) => onChange(e.split('_')[1])}
        />
    );
};

export default StatusDropdown;
