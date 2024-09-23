import React from 'react';
import styles from './Pagination.module.sass';
import Chevron from '../Dropdown/Default/Chevron';

const PaginationButton = ({ direction, label, onClick, disabled }) => {
  return (
    <button
      className={styles.paginationButton}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === 'left' && (
        <Chevron className={styles.pagination} direction="left" />
      )}
      <span className={styles.label}>{label}</span>
      {direction === 'right' && (
        <Chevron className={styles.pagination} direction="right" />
      )}
    </button>
  );
};

export const PreviousButton = ({ onClick, disabled }) => (
  <PaginationButton
    direction="left"
    label="Предыдущая"
    onClick={onClick}
    disabled={disabled}
  />
);

export const NextButton = ({ onClick, disabled }) => (
  <PaginationButton
    direction="right"
    label="Следующая"
    onClick={onClick}
    disabled={disabled}
  />
);
