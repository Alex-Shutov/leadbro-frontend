import React from 'react';
import styles from './Link.module.sass';
import { Link } from 'react-router-dom';

const TableLink = ({ to, name, onClick }) => {
  return (
    <div onClick={onClick} className={styles.link}>
      <Link to={to}>{name}</Link>
    </div>
  );
};

export default TableLink;
