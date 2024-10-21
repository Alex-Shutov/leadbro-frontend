import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './TableSwitcher.module.sass';
import Button from "../../../../shared/Button";

const TableSwitcher = ({value}) => {
    return (
        <div className={styles.switcher}>
            <NavLink to="?filter=employers" className={value==='employers' ? styles.active:''}>
                <Button classname={styles.button} type={'secondary'} name={'Сотрудники'}/>
            </NavLink>
            <NavLink to="?filter=legals" className={value==='legals' ? styles.active:''}>
                <Button classname={styles.button} type={'secondary'} name={'Юр. лица'}/>
            </NavLink>
        </div>
    );
};

export default TableSwitcher;
